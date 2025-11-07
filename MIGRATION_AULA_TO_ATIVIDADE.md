# Migração de "Aula" para "Atividade"

## Resumo das Mudanças

Este documento descreve a migração da nomenclatura "Aula" para "Atividade" em todo o projeto.

## Backend

### Arquivos Criados/Atualizados:

1. **Models:**
   - ✅ `src/models/Atividade.model.js` - Novo model para Atividades
   - ✅ `src/models/Presenca.model.js` - Atualizado para suportar ambos (Aula e Atividade)

2. **Services:**
   - ✅ `src/services/atividade.service.js` - Novo service para Atividades

3. **Controllers:**
   - ✅ `src/controllers/atividade.controller.js` - Novo controller para Atividades

4. **Routes:**
   - ✅ `src/routes/atividade.routes.js` - Novas rotas `/atividades`
   - ✅ `src/routes/index.js` - Atualizado para incluir as novas rotas

5. **DTOs:**
   - ✅ `src/dto/AtividadeDTO.js` - Novo DTO para Atividades
   - ✅ `src/dto/index.js` - Atualizado para exportar AtividadeDTO

6. **Validators:**
   - ✅ `src/middlewares/validators/atividade.validator.js` - Novo validator

7. **Migrations:**
   - ✅ `migrations/20251107000000-rename-aulas-to-atividades.cjs` - Migração para renomear tabelas

### Banco de Dados:

- Tabela `aulas` → `atividades`
- Coluna `presencas.id_aula` → `presencas.id_atividade`
- Índices atualizados

### Rotas Disponíveis:

Novas rotas (recomendado):
- `GET /api/v2/atividades` - Lista todas as atividades
- `POST /api/v2/atividades` - Cria nova atividade
- `GET /api/v2/atividades/:id` - Obtém atividade por ID
- `PUT /api/v2/atividades/:id` - Atualiza atividade
- `DELETE /api/v2/atividades/:id` - Remove atividade

Rotas antigas (mantidas para compatibilidade):
- `GET /api/v2/aulas` - ainda funciona
- `POST /api/v2/aulas` - ainda funciona
- etc.

## Frontend

### Arquivos Criados/Atualizados:

1. **Services:**
   - ✅ `src/services/atividade.ts` - Novo service com funções de atividade
   - ✅ `src/services/class.ts` - Atualizado com fallback para compatibilidade

2. **Types:**
   - ✅ `src/types/assistido.ts` - Atualizado para usar `idAtividade`

### Arquivos que PRECISAM ser atualizados manualmente:

1. **Screens:**
   - `src/screens/Aulas/Class.tsx` → Renomear para `src/screens/Atividades/Activity.tsx`
   - `src/screens/Attendance/Attendance.tsx` - Atualizar referências de aula para atividade
   - `src/screens/Guardian/GuardianDashboard.tsx` - Atualizar labels e variáveis

2. **Components:**
   - `src/components/modals/aulas/CreateClassModal.tsx` → `src/components/modals/atividades/CreateActivityModal.tsx`
   - `src/components/modals/aulas/EditClassModal.tsx` → `src/components/modals/atividades/EditActivityModal.tsx`

3. **Tests:**
   - `src/__tests__/services/classService.test.ts` - Atualizar para usar atividade
   - `src/__tests__/services/presencaService.test.ts` - Atualizar idAula para idAtividade

4. **Routes/Index:**
   - `src/index.tsx` - Atualizar imports e rotas

## Como Aplicar as Mudanças

### Passo 1: Executar Migration

```bash
cd backend
npx sequelize-cli db:migrate
```

### Passo 2: Reiniciar Backend

```bash
npm run dev
```

### Passo 3: Atualizar Frontend (Manual)

Você precisará:

1. Renomear pastas e arquivos manualmente
2. Atualizar imports
3. Substituir strings em UI (texto exibido ao usuário)
4. Atualizar testes

### Substituições Recomendadas no Frontend:

```typescript
// Antes
import { Aula, listAulas, createAula } from 'services/class';

// Depois
import { Atividade, listAtividades, createAtividade } from 'services/atividade';

// Antes
const [aulas, setAulas] = useState<Aula[]>([]);

// Depois
const [atividades, setAtividades] = useState<Atividade[]>([]);

// Antes
<h1>Aulas</h1>

// Depois
<h1>Atividades</h1>
```

## Compatibilidade Retroativa

### Backend:
- ✅ Rotas antigas `/aulas` ainda funcionam
- ✅ Model Aula ainda existe
- ✅ Presenca model aceita ambos `idAula` e `idAtividade`

### Frontend:
- ✅ Services antigos (class.ts) tentam usar novos endpoints primeiro
- ✅ Types mantêm compatibilidade com nomes antigos
- ⚠️ Componentes e telas precisam ser atualizados manualmente

## Checklist de Migração

### Backend:
- [x] Criar model Atividade
- [x] Criar service Atividade  
- [x] Criar controller Atividade
- [x] Criar routes Atividade
- [x] Criar DTO Atividade
- [x] Criar validator Atividade
- [x] Criar migration para renomear tabelas
- [x] Atualizar model Presenca
- [x] Atualizar index de routes
- [x] Atualizar index de DTOs

### Frontend:
- [x] Criar service atividade.ts
- [x] Atualizar class.ts com fallback
- [x] Atualizar types/assistido.ts
- [ ] Renomear screens/Aulas para screens/Atividades
- [ ] Renomear components/modals/aulas para components/modals/atividades
- [ ] Atualizar Attendance.tsx
- [ ] Atualizar GuardianDashboard.tsx
- [ ] Atualizar index.tsx (rotas)
- [ ] Atualizar testes
- [ ] Atualizar strings de UI

## Notas Importantes

1. **Migração do Banco:** Execute a migration antes de iniciar o servidor
2. **Compatibilidade:** Os endpoints antigos continuarão funcionando
3. **Gradual:** Você pode migrar o frontend gradualmente
4. **Testes:** Rode os testes após cada mudança

## Próximos Passos

1. Executar a migration no banco de dados
2. Testar os novos endpoints `/atividades`
3. Atualizar componentes do frontend gradualmente
4. Atualizar testes
5. Remover código deprecated após completa migração
