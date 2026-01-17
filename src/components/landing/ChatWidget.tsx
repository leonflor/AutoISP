import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-20 right-4 z-50 w-80 md:w-96 transition-all duration-300 origin-bottom-right',
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        )}
      >
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-sm font-medium text-primary-foreground">
                  Assistente AutoISP
                </div>
                <div className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online agora
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="h-72 p-4 overflow-y-auto bg-secondary/30">
            {/* Bot Message */}
            <div className="flex items-start gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card rounded-lg rounded-tl-none px-3 py-2 shadow-sm border border-border max-w-[80%]">
                <p className="text-sm text-foreground">
                  Olá! 👋 Sou o assistente do AutoISP. Como posso ajudar você hoje?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card rounded-lg rounded-tl-none px-3 py-2 shadow-sm border border-border max-w-[80%]">
                <p className="text-sm text-foreground mb-2">
                  Posso te ajudar com:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dúvidas sobre planos</li>
                  <li>• Demonstração do sistema</li>
                  <li>• Suporte técnico</li>
                  <li>• Falar com nossa equipe</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-card">
            <form 
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) {
                  // Placeholder - will integrate with AI later
                  setMessage('');
                }
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Powered by AutoISP AI
            </p>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center',
          isOpen 
            ? 'bg-muted text-muted-foreground' 
            : 'bg-primary text-primary-foreground hover:scale-110'
        )}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
};
