import { useState } from 'react';
import { AgentSimulator } from '@/components/AgentSimulator';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

export default function TestAgent() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex items-center justify-center h-full">
      <Button onClick={() => setOpen(true)} size="lg">
        <Bot className="mr-2 h-5 w-5" /> Abrir Simulador
      </Button>
      <AgentSimulator
        open={open}
        onOpenChange={setOpen}
        tenantAgentId="1abd4b49-3a12-400e-8939-f386a2708c29"
        agentName="Atendente Geral (ISP Teste)"
        showDebug
      />
    </div>
  );
}
