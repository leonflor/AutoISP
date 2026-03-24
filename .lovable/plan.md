
Problema provável: a tela está quebrando ao abrir o modal porque o formato salvo em `procedures.definition` não bate com o formato que o editor espera.

O que encontrei:
- O editor (`src/components/admin/procedures/ProcedureEditor.tsx`) espera steps assim:
  - `available_functions: { handler, required }[]`
  - `stuck_config: { max_turns, action }`
  - `on_complete.conditions`
- Mas o banco tem steps assim:
  - `available_functions: string[]`
  - `stuck_after_turns`, `stuck_action`
  - `on_complete.rules`
- O backend (`supabase/functions/_shared/procedure-runner.ts`) também usa o formato antigo/string-array.
- Isso explica o “não abre tela”: ao editar, o modal renderiza e faz `.find()`/`.map()` assumindo objetos em `available_functions`, mas recebe strings do banco.

Plano de correção:
1. Normalizar os dados ao carregar no editor
   - Em `src/components/admin/procedures/ProcedureEditor.tsx`, criar um helper para converter o formato salvo no banco para o formato esperado pela UI.
   - Aplicar essa normalização no `useEffect` e também na inicialização dos estados.

2. Tornar o editor tolerante a dados legados
   - Garantir fallback para:
     - `available_functions` como `string[]` ou objeto[]
     - `stuck_after_turns/stuck_action` ou `stuck_config`
     - `on_complete.rules` ou `on_complete.conditions`
   - Assim o modal abre mesmo com registros antigos.

3. Normalizar antes de salvar
   - No submit, converter de volta para o formato que o backend realmente consome hoje.
   - Isso evita incompatibilidade entre UI e `procedure-runner`.

4. Ajustar tipagem do hook
   - Em `src/hooks/admin/useProcedures.ts`, revisar os tipos para refletirem que existem dados legados e evitar falsa segurança de TypeScript.

Arquivos a ajustar:
- `src/components/admin/procedures/ProcedureEditor.tsx`
- `src/hooks/admin/useProcedures.ts`

Resultado esperado:
- O modal volta a abrir ao clicar em “Procedimentos”
- Dados existentes carregam corretamente
- Salvar continua compatível com o motor atual de procedimentos

Detalhe técnico:
```text
Banco atual:
available_functions: ["get_open_invoices"]

UI espera:
available_functions: [{ handler: "get_open_invoices", required: false }]
```

Também vale revisar depois se você quer unificar definitivamente o schema entre UI e backend, porque hoje eles estão divergentes e isso tende a gerar novos bugs.
