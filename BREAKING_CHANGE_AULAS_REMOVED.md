# 🔴 BREAKING CHANGE: Rotas `/aulas` Removidas

## Data: 7 de Novembro de 2025

### O que mudou?

As rotas antigas `/api/v2/aulas` foram **completamente removidas** do sistema.

### Rotas Removidas:
- ❌ `GET /api/v2/aulas` 
- ❌ `POST /api/v2/aulas`
- ❌ `GET /api/v2/aulas/:id`
- ❌ `PUT /api/v2/aulas/:id`
- ❌ `DELETE /api/v2/aulas/:id`

### Use ao invés:
- ✅ `GET /api/v2/atividades` - Lista atividades
- ✅ `POST /api/v2/atividades` - Cria atividade
- ✅ `GET /api/v2/atividades/:id` - Obtém atividade
- ✅ `PUT /api/v2/atividades/:id` - Atualiza atividade
- ✅ `DELETE /api/v2/atividades/:id` - Remove atividade

### Impacto:

#### Frontend:
O serviço `class.ts` possui fallback automático que tenta usar `/atividades` primeiro. Se você ainda estiver usando as funções antigas (`listAulas`, `createAula`, etc.), elas vão **falhar** agora.

**Ação Necessária:**
```typescript
// ❌ NÃO FUNCIONA MAIS
import { listAulas, createAula } from 'services/class';

// ✅ USE ISTO
import { listAtividades, createAtividade } from 'services/atividade';
```

#### Banco de Dados:
- A tabela `aulas` ainda existe (para referência histórica)
- A tabela `atividades` é a nova tabela oficial
- A coluna `presencas.id_aula` foi substituída por `presencas.id_atividade`

### Swagger/OpenAPI:

As rotas `/aulas` **não aparecem mais** na documentação Swagger em `http://localhost:3001/api-docs`.

Apenas as rotas `/atividades` estão documentadas.

### Rollback (se necessário):

Se precisar restaurar as rotas antigas temporariamente:

1. Abra `backend/src/routes/index.js`
2. Descomente as linhas:
   ```javascript
   import aulaRoutes from './aula.routes.js';
   // ...
   router.use('/aulas', aulaRoutes);
   ```
3. Reinicie o servidor

### Próximos Passos:

1. ✅ Atualizar todo código do frontend para usar `/atividades`
2. ✅ Atualizar testes
3. ⚠️ Após confirmação que tudo funciona, considerar remover:
   - Arquivo `src/routes/aula.routes.js`
   - Arquivo `src/controllers/aula.controller.js`
   - Arquivo `src/services/aula.service.js`
   - Model `src/models/Aula.model.js` (manter por enquanto para compatibilidade)

### Suporte:

Se encontrar problemas, consulte:
- `RESUMO_MIGRACAO.md` - Status completo da migração
- `MIGRATION_AULA_TO_ATIVIDADE.md` - Guia detalhado
