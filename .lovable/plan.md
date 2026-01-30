
# Botão Global "Testar Agente" com Chat em Modal

## Objetivo

Substituir o botão "Chat" individual de cada card por um botão único global "Testar Agente" na página de Agentes de IA. Este botão abrirá um modal com interface de chat que permite ao cliente selecionar qual agente testar e conversar com ele. A conversa é temporária e expira ao fechar o modal.

---

## Mudanças Visuais

### Antes

```text
+---------------------------+
|  Agente Atendente         |
|  [Configurar] [Q&A] [Chat]|  <- Botão Chat em cada card
+---------------------------+
```

### Depois

```text
+---------------------------------------------------------------+
| Agentes de IA                    [Testar Agente]   <-- NOVO   |
+---------------------------------------------------------------+
| +---------------------------+  +---------------------------+  |
| |  Agente Atendente         |  |  Agente Cobrador          |  |
| |  [Configurar] [Base Q&A]  |  |  [Configurar] [Base Q&A]  |  |
| +---------------------------+  +---------------------------+  |
+---------------------------------------------------------------+
```

### Modal de Teste

```text
+-----------------------------------------------+
|  Testar Agente                           [X]  |
|-----------------------------------------------|
|  [v Agente Atendente]  (dropdown)             |
|-----------------------------------------------|
|                                               |
|  Ola! Sou o Agente Atendente.                 |
|  Como posso ajudar?                           |
|                                               |
|          +----------------------------+       |
|          | Ola, quero testar o agente |       |
|          +----------------------------+       |
|                                               |
|  Claro! Estou aqui para...                    |
|                                               |
|-----------------------------------------------|
|  [Digite sua mensagem...]          [Enviar]   |
+-----------------------------------------------+
```

---

## Arquivos a Remover

| Arquivo | Motivo |
|---------|--------|
| `src/pages/painel/AiChat.tsx` | Pagina de chat removida |

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Remover rota `/painel/chat` e import |
| `src/components/painel/ai/ActiveAgentCard.tsx` | Remover botao "Chat" |
| `src/pages/painel/AiAgents.tsx` | Adicionar botao global e modal de teste |

## Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/painel/ai/AgentTestDialog.tsx` | Modal com chat de teste |

---

## Secao Tecnica

### Componente AgentTestDialog

Novo componente que encapsula a logica de chat em um Dialog:

```typescript
interface AgentTestDialogProps {
  agents: IspAgentWithTemplate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAgentId?: string;
}

// Estado local (nao persistido):
// - messages: Message[]
// - selectedAgentId: string
// - inputMessage: string
// - isLoading: boolean

// Ao fechar o modal:
// - Limpar messages array
// - Resetar estado
```

### Estrutura do Modal

Seguindo o padrao `memory/style/standard-modal-layout`:

```typescript
<Dialog>
  <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle>Testar Agente</DialogTitle>
      <DialogDescription>
        Converse com seu agente para verificar as respostas.
      </DialogDescription>
    </DialogHeader>

    {/* Seletor de Agente */}
    <div className="flex-shrink-0 pb-4 border-b">
      <Select value={selectedAgentId} onValueChange={handleAgentChange}>
        {/* Lista de agentes ativos */}
      </Select>
    </div>

    {/* Area de Mensagens */}
    <ScrollArea className="flex-1 py-4">
      {/* Mensagens do chat */}
    </ScrollArea>

    {/* Input fixo no rodape */}
    <div className="flex-shrink-0 pt-4 border-t">
      <div className="flex gap-2">
        <Textarea ... />
        <Button onClick={sendMessage}>
          <Send />
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### Logica de Limpeza

```typescript
// Ao trocar de agente OU fechar modal
const handleAgentChange = (newAgentId: string) => {
  setSelectedAgentId(newAgentId);
  setMessages([]); // Limpa historico
  setTokensUsed(0);
};

const handleOpenChange = (open: boolean) => {
  if (!open) {
    // Limpa tudo ao fechar
    setMessages([]);
    setInputMessage("");
    setTokensUsed(0);
  }
  onOpenChange(open);
};
```

### Modificacao no AiAgentsPage

```typescript
// Estado para controlar o modal
const [testDialogOpen, setTestDialogOpen] = useState(false);

// No header da pagina, adicionar botao
<div className="flex items-center justify-between">
  <div>
    <h1>Agentes de IA</h1>
    <p>Gerencie e utilize os agentes inteligentes</p>
  </div>
  <div className="flex items-center gap-4">
    {/* Badges existentes */}
    <Badge>...</Badge>
    <Card>...</Card>

    {/* Novo botao global */}
    <Button
      onClick={() => setTestDialogOpen(true)}
      disabled={enabledAgents.length === 0}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Testar Agente
    </Button>
  </div>
</div>

{/* Modal de teste */}
<AgentTestDialog
  agents={activeAgents?.filter(a => a.is_enabled) || []}
  open={testDialogOpen}
  onOpenChange={setTestDialogOpen}
/>
```

### Modificacao no ActiveAgentCard

Remover o botao "Chat":

```typescript
// REMOVER este bloco:
<Button
  size="sm"
  className="flex-1"
  disabled={!agent.is_enabled || isTemplateInactive}
  onClick={() => navigate(`/painel/chat?agent=${template.slug}`)}
>
  <MessageSquare ... />
  Chat
</Button>

// Manter apenas:
<div className="flex gap-2 mt-auto pt-2">
  <Button variant="outline" size="sm" onClick={onConfigure}>
    <Settings /> Configurar
  </Button>

  {template.uses_knowledge_base && (
    <Button variant="outline" size="sm" onClick={...}>
      <BookOpen /> Base Q&A
    </Button>
  )}
</div>
```

---

## Ordem de Implementacao

1. Criar `AgentTestDialog.tsx` com logica de chat
2. Modificar `AiAgentsPage.tsx` para adicionar botao global e importar dialog
3. Modificar `ActiveAgentCard.tsx` para remover botao Chat
4. Remover `src/pages/painel/AiChat.tsx`
5. Atualizar `App.tsx` para remover rota e import
6. Testar fluxo completo

---

## Comportamento Final

| Acao | Resultado |
|------|-----------|
| Clicar "Testar Agente" | Abre modal com dropdown de agentes |
| Selecionar outro agente | Limpa mensagens, inicia nova conversa |
| Enviar mensagem | Chama edge function ai-chat |
| Fechar modal (X ou ESC) | Descarta toda a conversa |
| Reabrir modal | Inicia vazio, sem historico |
