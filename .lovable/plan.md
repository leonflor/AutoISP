

# Corrigir auto-scroll do chat do simulador

## Problema

O `ScrollArea` do Radix UI encaminha o `ref` para o elemento root, nao para o viewport rolavel. Assim, `scrollRef.current.scrollTop = scrollRef.current.scrollHeight` nao tem efeito — o elemento referenciado nao e o que faz scroll.

## Solucao

Adicionar um elemento sentinela no final da lista de mensagens e usar `scrollIntoView` para rolar automaticamente quando novas mensagens chegam.

### Arquivo: `src/components/AgentSimulator.tsx`

1. Trocar `scrollRef` de `HTMLDivElement` para apontar a um elemento sentinela no final das mensagens
2. Adicionar `<div ref={bottomRef} />` apos o ultimo item dentro do `ScrollArea`
3. No `useEffect`, chamar `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })`
4. Remover o `ref` do `ScrollArea` (nao e mais necessario)

Mudanca equivalente:

```tsx
const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, sending]);

// Dentro do ScrollArea, apos o bloco de sending:
<div ref={bottomRef} />
```

