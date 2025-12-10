import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || stripeKey === "sk_test_placeholder") {
      console.log("Stripe not configured, skipping webhook");
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    const Stripe = (await import("https://esm.sh/stripe@14.14.0")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let event;
    
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", message);
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          // Update or create subscription record
          await supabase.from("plan_subscriptions").upsert({
            user_id: userId,
            plan: plan,
            status: "active",
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            current_period_start: new Date().toISOString(),
          }, { onConflict: "user_id" });

          // Update user profile plan
          await supabase
            .from("user_profiles")
            .update({ plan: plan })
            .eq("user_id", userId);

          // Log the event
          await supabase.from("billing_audit_logs").insert({
            user_id: userId,
            event_type: "subscription_created",
            plan_to: plan,
            stripe_event_id: event.id,
            metadata: { session_id: session.id, customer_id: session.customer },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const status = subscription.status;
          const cancelAtPeriodEnd = subscription.cancel_at_period_end;

          // Get plan from price
          let plan = "free";
          const priceId = subscription.items?.data[0]?.price?.id;
          if (priceId?.includes("pro")) plan = "pro";
          else if (priceId?.includes("premium")) plan = "premium";

          await supabase.from("plan_subscriptions").upsert({
            user_id: userId,
            plan: plan,
            status: status,
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: cancelAtPeriodEnd,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: "user_id" });

          // Update user profile if subscription is active
          if (status === "active") {
            await supabase
              .from("user_profiles")
              .update({ plan: plan })
              .eq("user_id", userId);
          }

          await supabase.from("billing_audit_logs").insert({
            user_id: userId,
            event_type: "subscription_updated",
            plan_to: plan,
            stripe_event_id: event.id,
            metadata: { status, cancel_at_period_end: cancelAtPeriodEnd },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          await supabase.from("plan_subscriptions").update({
            status: "canceled",
            plan: "free",
          }).eq("user_id", userId);

          await supabase
            .from("user_profiles")
            .update({ plan: "free" })
            .eq("user_id", userId);

          await supabase.from("billing_audit_logs").insert({
            user_id: userId,
            event_type: "subscription_canceled",
            plan_from: subscription.metadata?.plan || "unknown",
            plan_to: "free",
            stripe_event_id: event.id,
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const { data: sub } = await supabase
            .from("plan_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (sub) {
            await supabase.from("plan_subscriptions").update({
              invoice_url: invoice.hosted_invoice_url,
              status: "active",
            }).eq("stripe_subscription_id", subscriptionId);

            await supabase.from("billing_audit_logs").insert({
              user_id: sub.user_id,
              event_type: "payment_succeeded",
              amount_cents: invoice.amount_paid,
              currency: invoice.currency,
              stripe_event_id: event.id,
              metadata: { invoice_id: invoice.id },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const { data: sub } = await supabase
            .from("plan_subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (sub) {
            await supabase.from("plan_subscriptions").update({
              status: "unpaid",
            }).eq("stripe_subscription_id", subscriptionId);

            await supabase.from("billing_audit_logs").insert({
              user_id: sub.user_id,
              event_type: "payment_failed",
              amount_cents: invoice.amount_due,
              currency: invoice.currency,
              stripe_event_id: event.id,
            });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
