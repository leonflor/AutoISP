import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SendMessageFormProps {
  onSend: (data: {
    to: string;
    message?: string;
    template_name?: string;
    template_language?: string;
    template_params?: Record<string, string>[];
  }) => void;
  isPending: boolean;
}

export function SendMessageForm({ onSend, isPending }: SendMessageFormProps) {
  const [mode, setMode] = useState<'text' | 'template'>('text');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('pt_BR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to) return;

    if (mode === 'text') {
      if (!message) return;
      onSend({ to, message });
    } else {
      if (!templateName) return;
      onSend({ to, template_name: templateName, template_language: templateLanguage });
    }

    setMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="h-5 w-5" />
          Enviar Mensagem
        </CardTitle>
        <CardDescription>
          Envie mensagens de texto ou templates via WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Mensagem</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as 'text' | 'template')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto Livre</SelectItem>
                <SelectItem value="template">Template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Número do Destinatário</Label>
            <Input
              placeholder="5511999999999"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Formato internacional sem + (ex: 5511999999999)
            </p>
          </div>

          {mode === 'text' ? (
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Nome do Template</Label>
                <Input
                  placeholder="hello_world"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nome do template aprovado no Meta Business Manager
                </p>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt_BR">Português (BR)</SelectItem>
                    <SelectItem value="en_US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
