/**
 * WhatsAppConfigPanel - Painel de configuração do botão de WhatsApp
 * Usado nas configurações gerais da LP
 */

import { useState } from 'react';
import { MessageCircle, Phone, MessageSquare, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WhatsAppConfig } from '@/components/WhatsAppFloatingButton';

interface WhatsAppConfigPanelProps {
  config: WhatsAppConfig;
  onChange: (key: keyof WhatsAppConfig, value: string) => void;
  className?: string;
}

export const WhatsAppConfigPanel = ({
  config,
  onChange,
  className,
}: WhatsAppConfigPanelProps) => {
  const isEnabled = config.whatsapp_enabled === 'true';

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b">
        <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
        </div>
        <div>
          <h3 className="font-medium">Botão Flutuante do WhatsApp</h3>
          <p className="text-xs text-muted-foreground">
            Exibe um botão fixo para contato direto
          </p>
        </div>
      </div>

      {/* Toggle ativar */}
      <div className="flex items-center justify-between">
        <Label htmlFor="whatsapp-enabled" className="flex items-center gap-2 cursor-pointer">
          <span>Ativar botão flutuante</span>
        </Label>
        <Switch
          id="whatsapp-enabled"
          checked={isEnabled}
          onCheckedChange={(checked) => onChange('whatsapp_enabled', checked ? 'true' : 'false')}
        />
      </div>

      {/* Configurações - só mostra se ativo */}
      {isEnabled && (
        <div className="space-y-4 pt-2">
          {/* Número de telefone */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp-phone" className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Número do WhatsApp
            </Label>
            <Input
              id="whatsapp-phone"
              type="tel"
              placeholder="5511999999999 (com código do país)"
              value={config.whatsapp_phone || ''}
              onChange={(e) => onChange('whatsapp_phone', e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              Inclua código do país (55 para Brasil) + DDD + número
            </p>
          </div>

          {/* Mensagem padrão */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp-message" className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Mensagem padrão (opcional)
            </Label>
            <Textarea
              id="whatsapp-message"
              placeholder="Olá! Vim do site e gostaria de mais informações..."
              value={config.whatsapp_default_message || ''}
              onChange={(e) => onChange('whatsapp_default_message', e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Esta mensagem será preenchida automaticamente ao abrir o chat
            </p>
          </div>

          {/* Posição */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp-position" className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Posição na tela
            </Label>
            <Select
              value={config.whatsapp_position || 'bottom_right'}
              onValueChange={(value) => onChange('whatsapp_position', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Escolha a posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom_right">Inferior direita</SelectItem>
                <SelectItem value="bottom_left">Inferior esquerda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-3">Preview:</p>
            <div className={cn(
              'relative h-24 bg-background rounded-lg border overflow-hidden'
            )}>
              <div className={cn(
                'absolute bottom-3 flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg',
                config.whatsapp_position === 'bottom_left' ? 'left-3' : 'right-3'
              )}>
                <MessageCircle className="w-6 h-6" fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppConfigPanel;
