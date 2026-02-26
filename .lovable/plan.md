

## Plano: Adicionar regra de proteção ao plan.md

Adicionar uma seção de regras de proteção no `plan.md` que documente explicitamente a restrição sobre a camada de Providers e field-maps.

### Edição em `.lovable/plan.md`

Após a linha 7 (bloco "Regra de Equivalências"), adicionar:

```markdown
## Regras de Proteção

> **ALERTA OBRIGATÓRIO**: Os arquivos abaixo NÃO podem ser editados sem ordem expressa do usuário. Qualquer plano que preveja alteração neles deve alertar antes de implementar:
> - `field-maps.ts` — mapeamento declarativo ERP → modelo
> - `erp-providers/*.ts` — conectores HTTP dos ERPs
> - `ixc-types.ts` — modelagem ORM dos campos IXC
```

Nenhum outro arquivo será alterado.

