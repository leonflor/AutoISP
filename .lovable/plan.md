

# Plano: Adicionar log de depuração para capturar payload exato do IXC

## Diagnóstico

O código atual em `erp-driver.ts` e `tool-handlers.ts` está correto conforme as alterações anteriores. O problema pode ser:

1. **O deploy não foi aplicado** — a edge function pode estar rodando uma versão cacheada
2. **O IXC retorna dados diferentes do esperado** — os campos `endereco`, `numero`, `bairro` podem conter valores inesperados no endpoint `cliente_contrato`

Para depurar, precisamos ver o payload cru (raw) que o IXC retorna **e** o payload final que a tool entrega ao agente.

## Alterações

### 1. Adicionar log detalhado no IXC provider (`erp-providers/ixc.ts`)

Na função `fetchContratosDetalhados` (linha 284-299), adicionar um `console.log` dos registros brutos retornados pelo IXC **antes** do mapeamento:

```typescript
const ativos = recs.filter((ct: any) => ct.status === "A");
console.log(`[IXC] fetchContratosDetalhados raw (${ativos.length} ativos):`, JSON.stringify(ativos.map((ct: any) => ({
  id: ct.id, endereco: ct.endereco, numero: ct.numero, complemento: ct.complemento, bairro: ct.bairro, cidade: ct.cidade, estado: ct.estado
}))));
```

### 2. Adicionar log do payload final no ai-chat (`ai-chat/index.ts`)

Na linha 691, expandir o log para incluir o payload completo da tool:

```typescript
console.log(`🔧 Tool result: ${fnName} -> success=${result.success}`, JSON.stringify(result));
```

### 3. Redeploy da edge function `ai-chat`

Após as alterações, fazer redeploy para garantir que o runtime usa o código atualizado.

### 4. Teste e leitura dos logs

Após o deploy, você testa no painel (diz "boleto", informa o CNPJ `12.059.400/0001-51`) e eu leio os logs da edge function para ver:
- O payload bruto do IXC (campos de endereço reais)
- O payload final enviado ao modelo (com `lista_formatada`)

## Resultado esperado

Nos logs aparecerá algo como:

```
[IXC] fetchContratosDetalhados raw (6 ativos): [{"id":"123","endereco":"Quadra Central 1","numero":"SN","complemento":null,"bairro":"Sobradinho","cidade":"5564","estado":"8"}]

🔧 Tool result: erp_contract_lookup -> success=true {"success":true,"data":{"encontrados":6,"lista_formatada":"1. Quadra Central 1, Sobradinho\n\n2. ..."}}
```

Com isso saberemos exatamente o que está acontecendo e se o deploy está realmente ativo.

