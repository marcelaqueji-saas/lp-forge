import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  plan: "pro" | "premium";
  successUrl?: string;
  cancelUrl?: string;
}

const PLAN_PRICES: Record<string, { price_id: string; name: string }> = {
  pro: {
    price_id: Deno.env.get("STRIPE_PRO_PRICE_ID") || "price_pro_placeholder",
    name: "Pro",
  },
  premium: {
    price_id: Deno.env.get("STRIPE_PREMIUM_PRICE_ID") || "price_premium_placeholder",
    name: "Premium",
  },
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey === "sk_test_placeholder") {
      return new Response(
        JSON.stringify({ 
          error: "Stripe not configured", 
          message: "Payment system is being set up. Please try again later." 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    if (!plan || !PLAN_PRICES[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already has a subscription
    const { data: existingSub } = await supabase
      .from("plan_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    // Dynamic import Stripe
    const Stripe = (await import("https://esm.sh/stripe@14.14.0")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let customerId = existingSub?.stripe_customer_id;

    // Create or get customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://preview--ulsugfcfhoetdmhglvuy.lovable.app";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLAN_PRICES[plan].price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${origin}/painel?upgrade=success&plan=${plan}`,
      cancel_url: cancelUrl || `${origin}/upgrade?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: plan,
        },
      },
    });

    // Log the checkout attempt
    await supabase.from("billing_audit_logs").insert({
      user_id: user.id,
      event_type: "checkout_initiated",
      plan_to: plan,
      metadata: { session_id: session.id },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
