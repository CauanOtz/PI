# Resumo da Normalização do Backend (3FN)

## Objetivo
Migrar o esquema de banco de dados de uma estrutura desnormalizada (campos repetidos e dependências transitivas) para uma estrutura normalizada seguindo a Terceira Forma Normal (3FN).

## Alterações no Esquema do Banco de Dados

### Novas Tabelas Criadas

#### 1. `enderecos`
Armazena endereços únicos por CEP (evita redundância)
```sql
- id (PK)
- cep (UNIQUE, formato: 12345-678)
- logradouro
- bairro
- cidade
- estado
- created_at, updated_at
```

#### 2. `contatos_assistido`
Permite múltiplos contatos por assistido
```sql
- id (PK)
- assistido_id (FK -> assistidos.id, CASCADE)
- telefone
- nome_contato
- parentesco
- observacao
- ordem_prioridade (1=principal, 2=secundário, etc)
- created_at, updated_at
- UNIQUE(assistido_id, telefone)
```

#### 3. `filiacao_assistido`
Armazena informações dos pais de forma normalizada
```sql
- id (PK)
- assistido_id (FK -> assistidos.id, CASCADE)
- tipo (ENUM: 'mae', 'pai')
- nome_completo
- created_at, updated_at
- UNIQUE(assistido_id, tipo)
```

### Modificações na Tabela `assistidos`

**Campos Removidos:**
- `endereco` (VARCHAR 255)
- `bairro` (VARCHAR 100)
- `cep` (VARCHAR 9)
- `cidade` (VARCHAR 100)
- `contato` (VARCHAR 20)
- `pai` (VARCHAR 100)
- `mae` (VARCHAR 100)

**Campos Adicionados:**
- `endereco_id` (FK -> enderecos.id, NULL allowed)
- `numero` (VARCHAR 10)
- `complemento` (VARCHAR 100)

**Campos Modificados:**
- `problemas_saude` (VARCHAR 1000 → TEXT)

### Tabelas Removidas
- `notificacoes` (funcionalidade descontinuada)
- `usuarios_notificacoes` (funcionalidade descontinuada)
- `responsaveis_assistidos` (funcionalidade descontinuada)

## Arquivos Criados

### Models
1. **Endereco.model.js** - Modelo para endereços
2. **ContatoAssistido.model.js** - Modelo para contatos
3. **FiliacaoAssistido.model.js** - Modelo para filiação

### Services
1. **endereco.service.js**
   - `findOrCreate(enderecoData)` - Busca ou cria endereço por CEP
   - `findByCep(cep)` - Busca endereço por CEP
   - `update(id, data)` - Atualiza endereço
   - `findById(id)` - Busca por ID

2. **contato-assistido.service.js**
   - `create(assistidoId, contatoData, transaction)` - Cria contato
   - `createMultiple(assistidoId, contatos, transaction)` - Cria múltiplos contatos
   - `update(contatoId, data)` - Atualiza contato
   - `delete(contatoId)` - Remove contato
   - `findByAssistido(assistidoId)` - Lista contatos do assistido
   - `deleteByAssistido(assistidoId, transaction)` - Remove todos os contatos
   - `replaceAll(assistidoId, contatos, transaction)` - Substitui todos os contatos (usado no update)

3. **filiacao-assistido.service.js**
   - `createOrUpdate(assistidoId, tipo, nomeCompleto, transaction)` - Cria ou atualiza filiação
   - `createFromObject(assistidoId, filiacao, transaction)` - Aceita objeto {mae, pai}
   - `findByAssistido(assistidoId)` - Busca filiação do assistido
   - `getFiliacaoObject(assistidoId)` - Retorna objeto {mae, pai}
   - `delete(assistidoId, tipo, transaction)` - Remove filiação específica
   - `deleteAll(assistidoId, transaction)` - Remove todas as filiações

### DTOs
1. **EnderecoDTO.js**
   - Transforma modelo para camelCase
   - `toFormattedString(numero, complemento)` - Formata endereço completo

2. **ContatoAssistidoDTO.js**
   - Transforma contato para JSON
   - `fromArray(contatos)` - Converte array de contatos

3. **FiliacaoAssistidoDTO.js**
   - `toObject(filiacoes)` - Converte array para {mae, pai}
   - `fromArray(filiacoes)` - Retorna array de DTOs

### Migration Script
**migrate-to-normalized-schema.js** - Script completo de migração em 8 fases:
1. Criar tabela `enderecos`
2. Criar tabela `contatos_assistido`
3. Criar tabela `filiacao_assistido`
4. Migrar dados de endereço (agrupa por CEP, extrai número do campo `endereco`)
5. Migrar contatos (split de `contato` e `contato_emergencia`)
6. Migrar filiação (cria registros de mae/pai)
7. Remover colunas antigas de `assistidos`
8. Remover tabelas obsoletas e criar índices

## Arquivos Modificados

### Models
**Assistido.model.js**
- Removidos campos desnormalizados
- Adicionados: enderecoId, numero, complemento
- Configuradas associações:
  - `belongsTo(Endereco, {as: 'endereco'})`
  - `hasMany(ContatoAssistido, {as: 'contatos'})`
  - `hasMany(FiliacaoAssistido, {as: 'filiacao'})`

**models/index.js**
- Removidos imports: Notificacao, UsuarioNotificacao, ResponsavelAssistido
- Adicionados imports: Endereco, ContatoAssistido, FiliacaoAssistido

### Services
**assistido.service.js** (Completamente reescrito)
- `listAll()` - Inclui enderecos, contatos e filiacao nos resultados
- `getById()` - Carrega assistido com todos os relacionamentos
- `create()` - Usa transações para criar assistido + endereco + contatos + filiacao atomicamente
- `update()` - Usa transações para atualizar todos os dados relacionados
- `delete()` - Remove assistido (CASCADE remove contatos e filiacao automaticamente)

### Controllers
**assistido.controller.js**
- `criarAssistido()` - Aceita novo formato de payload:
  ```json
  {
    "nome": "...",
    "dataNascimento": "...",
    "sexo": "...",
    "cartaoSus": "...",
    "rg": "...",
    "endereco": {
      "cep": "12345-678",
      "logradouro": "Rua das Flores",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP"
    },
    "numero": "123",
    "complemento": "Apto 45",
    "contatos": [
      {
        "telefone": "(11) 98765-4321",
        "nomeContato": "Maria",
        "parentesco": "Mãe",
        "ordemPrioridade": 1
      },
      {
        "telefone": "(11) 91234-5678",
        "nomeContato": "João",
        "parentesco": "Pai",
        "ordemPrioridade": 2
      }
    ],
    "filiacao": {
      "mae": "Maria Silva",
      "pai": "João Silva"
    },
    "problemasSaude": "..."
  }
  ```

- `atualizarAssistido()` - Mesmo formato de payload
- `listarAssistidos()` - Retorna assistidos com todos os relacionamentos
- `obterAssistidoPorId()` - Retorna assistido completo

### DTOs
**AssistidoDTO.js**
- Removidas propriedades antigas (endereco string, bairro, cep, cidade, contato, pai, mae)
- Adicionadas:
  - `endereco` (objeto EnderecoDTO ou null)
  - `numero`, `complemento`
  - `contatos` (array de ContatoAssistidoDTO)
  - `filiacao` (objeto {mae, pai})
- Novos métodos:
  - `getEnderecoCompleto()` - Retorna string do endereço formatado
  - `getContatoPrincipal()` - Retorna primeiro contato da lista

### Configuração
**app.js**
- Removida rota `/api/v2/responsaveis-assistidos`
- Removida rota `/api/v2/notificacoes`

## Arquivos Removidos

### Models
- Notificacao.model.js
- UsuarioNotificacao.model.js
- ResponsavelAssistido.model.js

### Services
- notificacao.service.js
- responsavel-assistido.service.js

### Controllers
- notificacao.controller.js
- responsavel-assistido.controller.js

### Routes
- notificacao.routes.js
- responsavel-assistido.routes.js

### Validators
- notificacao.validator.js

### Tests
- notificacao.service.test.js
- notificacao.controller.test.js

## Estrutura de Resposta da API (Novo Formato)

### GET /api/v2/assistidos/:id
```json
{
  "sucesso": true,
  "dados": {
    "assistido": {
      "id": 1,
      "nome": "Maria Silva",
      "dataNascimento": "2015-07-22",
      "sexo": "Feminino",
      "cartaoSus": "163704163610004",
      "rg": "12.345.678-9",
      "numero": "123",
      "complemento": "Apto 45",
      "problemasSaude": "Alergia a dipirona",
      "endereco": {
        "id": 1,
        "cep": "12345-678",
        "logradouro": "Rua das Flores",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estado": "SP"
      },
      "contatos": [
        {
          "id": 1,
          "telefone": "(11) 98765-4321",
          "nomeContato": "Maria da Silva",
          "parentesco": "Mãe",
          "observacao": null,
          "ordemPrioridade": 1
        },
        {
          "id": 2,
          "telefone": "(11) 91234-5678",
          "nomeContato": "João Silva",
          "parentesco": "Pai",
          "observacao": "Ligar apenas emergências",
          "ordemPrioridade": 2
        }
      ],
      "filiacao": {
        "mae": "Maria da Silva Santos",
        "pai": "João Silva Santos"
      },
      "createdAt": "2025-01-07T12:00:00.000Z",
      "updatedAt": "2025-01-07T12:00:00.000Z"
    }
  }
}
```

## Benefícios da Normalização

### 1. Eliminação de Redundância
- CEPs iguais compartilham o mesmo registro de endereço
- Reduz duplicação de dados (logradouro, bairro, cidade, estado)

### 2. Integridade Referencial
- Foreign keys com CASCADE garantem consistência
- Impossível ter contatos ou filiação órfãos

### 3. Flexibilidade
- Permite múltiplos contatos por assistido
- Facilita adição de novos tipos de contato no futuro
- Endereços podem ser atualizados centralmente

### 4. Conformidade com 3FN
- 1FN: Sem grupos repetidos (contatos agora em tabela separada)
- 2FN: Todos os atributos dependem da chave primária completa
- 3FN: Sem dependências transitivas (CEP → bairro/cidade/estado agora normalizado)

### 5. Performance
- Índices criados em foreign keys
- Queries podem usar UNIQUE INDEX em CEP
- Buscas por endereço mais eficientes

## Próximos Passos

### Backend (Pendente)
1. ✅ Executar migration script em produção
2. ⏳ Atualizar testes unitários
3. ⏳ Atualizar validações para novo formato
4. ⏳ Atualizar documentação Swagger/OpenAPI

### Frontend (Pendente)
1. ⏳ Atualizar tipos TypeScript (interfaces)
2. ⏳ Modificar formulário de cadastro/edição de assistidos
3. ⏳ Atualizar serviços de API
4. ⏳ Ajustar componentes de exibição
5. ⏳ Implementar gerenciamento de múltiplos contatos na UI

## Como Executar a Migração

### Desenvolvimento
```bash
cd backend
cp .env .env.backup  # Backup do .env atual
# Configurar .env.production com credenciais do Supabase
node migrate-to-normalized-schema.js
```

### Rollback (Se Necessário)
Não há script automático de rollback. Em caso de problemas:
1. Restaurar backup do banco de dados
2. Reverter código para commit anterior
3. Executar `git checkout <commit-anterior>`

### Validação Pós-Migração
```sql
-- Verificar se dados foram migrados
SELECT COUNT(*) FROM enderecos;
SELECT COUNT(*) FROM contatos_assistido;
SELECT COUNT(*) FROM filiacao_assistido;

-- Verificar se assistidos têm endereco_id
SELECT COUNT(*) FROM assistidos WHERE endereco_id IS NOT NULL;

-- Verificar se cada assistido tem pelo menos 1 contato
SELECT a.id, a.nome, COUNT(c.id) as num_contatos
FROM assistidos a
LEFT JOIN contatos_assistido c ON c.assistido_id = a.id
GROUP BY a.id, a.nome
HAVING COUNT(c.id) = 0;  -- Não deve retornar nenhum resultado
```

## Notas Importantes

1. **Contato Obrigatório**: O sistema agora requer pelo menos 1 contato por assistido
2. **CEP Compartilhado**: Endereços com mesmo CEP compartilham registro (economia de espaço)
3. **Número Separado**: Campo `numero` agora é separado do logradouro
4. **Transações**: Todas as operações de create/update usam transações para garantir atomicidade
5. **CASCADE Delete**: Ao remover assistido, contatos e filiação são removidos automaticamente
6. **Ordem de Prioridade**: Contatos têm ordem de prioridade (1=principal, 2=secundário, etc)

## Autores
Migração implementada em Janeiro de 2025
