# Aplicar Migrações 3FN ao Supabase

Este documento explica como aplicar as migrações de normalização 3FN ao banco de dados Supabase em produção.

## 🔍 Problema

O banco de dados Supabase em produção estava desatualizado. A migração 3FN não foi aplicada completamente:
- ✅ Tabela `assistidos` existe
- ✅ Tabela `enderecos` existe (mas com UNIQUE constraint no CEP)
- ❌ **Colunas `pai` e `mae` ainda na tabela `assistidos`** (deveriam estar na tabela `filiacao_assistido`)
- ❌ **Tabela `contatos_assistido` não existe**
- ❌ **Tabela `filiacao_assistido` não existe**

## 📋 O que o script faz

O script `apply-3fn-migrations-supabase.js` aplica todas as migrações necessárias:

1. ✅ Cria tabela `enderecos` (se não existir)
2. ✅ Cria tabela `contatos_assistido` com foreign key para `assistidos`
3. ✅ Cria tabela `filiacao_assistido` com foreign key para `assistidos`
4. ✅ Adiciona coluna `endereco_id` à tabela `assistidos`
5. ✅ Adiciona colunas `numero` e `complemento` à tabela `assistidos`
6. ✅ **Remove colunas `pai` e `mae` da tabela `assistidos`**
7. ✅ Remove UNIQUE constraint do campo `cep` na tabela `enderecos`
8. ✅ Registra migrações no `SequelizeMeta`

## 🚀 Como executar

### Pré-requisitos

1. Arquivo `.env` configurado com as credenciais do Supabase:
```env
DB_HOST=seu-projeto.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua-senha-supabase
DB_SSL=true
```

### Executar o script

```powershell
cd backend
node apply-3fn-migrations-supabase.js
```

### Saída esperada

```
🔵 Conectando ao Supabase...
Host: seu-projeto.supabase.co
Database: postgres
User: postgres
✅ Conectado ao banco de dados Supabase

📋 Passo 1: Criando tabela enderecos...
⚠️  Tabela enderecos já existe, pulando...

📋 Passo 2: Criando tabela contatos_assistido...
✅ Tabela contatos_assistido criada com sucesso

📋 Passo 3: Criando tabela filiacao_assistido...
✅ Tabela filiacao_assistido criada com sucesso

📋 Passo 4: Adicionando coluna endereco_id à tabela assistidos...
✅ Coluna endereco_id adicionada com sucesso

📋 Passo 5: Removendo colunas pai e mae da tabela assistidos...
✅ Colunas pai e mae removidas com sucesso

📋 Passo 6: Removendo UNIQUE constraint do CEP...
✅ UNIQUE constraint 'enderecos_cep_key' removida do CEP

📋 Passo 7: Registrando migrações no SequelizeMeta...
✅ Migração 20251111000001-create-enderecos.cjs registrada
✅ Migração 20251111000002-create-contatos-assistido.cjs registrada
✅ Migração 20251111000003-create-filiacao-assistido.cjs registrada
✅ Migração 20251116000000-remove-cep-unique-constraint.cjs registrada

✅ TODAS AS MIGRAÇÕES 3FN APLICADAS COM SUCESSO!

📊 Estrutura final do banco:
   ✓ enderecos (cep, logradouro, bairro, cidade, estado)
   ✓ assistidos (endereco_id FK, numero, complemento)
   ✓ contatos_assistido (assistido_id FK, telefone, nome_contato, parentesco)
   ✓ filiacao_assistido (assistido_id FK, tipo [mae/pai], nome_completo)

🎉 Banco de dados está agora em 3FN (Third Normal Form)!
```

## ⚠️ IMPORTANTE

**ANTES DE EXECUTAR EM PRODUÇÃO:**

1. ⚠️ **FAÇA BACKUP DO BANCO DE DADOS** no painel do Supabase
2. ⚠️ O script remove as colunas `pai` e `mae` da tabela `assistidos`
3. ⚠️ Se houver dados nessas colunas, **eles serão perdidos**
4. ⚠️ Execute primeiro em ambiente de desenvolvimento/staging

### Migrar dados existentes (se necessário)

Se você tem dados nas colunas `pai` e `mae` que precisa preservar, execute este SQL **ANTES** do script:

```sql
-- Migrar dados de pai/mae para filiacao_assistido
INSERT INTO filiacao_assistido (assistido_id, tipo, nome_completo, created_at, updated_at)
SELECT id, 'mae', mae, NOW(), NOW()
FROM assistidos
WHERE mae IS NOT NULL AND mae != '';

INSERT INTO filiacao_assistido (assistido_id, tipo, nome_completo, created_at, updated_at)
SELECT id, 'pai', pai, NOW(), NOW()
FROM assistidos
WHERE pai IS NOT NULL AND pai != '';
```

## 📝 Migrações incluídas

1. **20251111000001-create-enderecos.cjs**
   - Cria tabela de endereços normalizados
   - Campos: cep, logradouro, bairro, cidade, estado

2. **20251111000002-create-contatos-assistido.cjs**
   - Cria tabela de contatos (1-to-many)
   - UNIQUE constraint: assistido_id + telefone

3. **20251111000003-create-filiacao-assistido.cjs**
   - Cria tabela de filiação (1-to-many, mas limitado a 2: pai/mãe)
   - UNIQUE constraint: assistido_id + tipo
   - CHECK constraint: tipo IN ('mae', 'pai')

4. **20251116000000-remove-cep-unique-constraint.cjs**
   - Remove UNIQUE do CEP (permite múltiplos endereços com mesmo CEP mas ruas diferentes)

## ✅ Verificação pós-aplicação

Após executar o script, verifique no painel do Supabase:

1. Tabela `contatos_assistido` existe
2. Tabela `filiacao_assistido` existe
3. Tabela `assistidos` não tem colunas `pai` e `mae`
4. Tabela `assistidos` tem coluna `endereco_id`
5. Tabela `enderecos` não tem UNIQUE no `cep`

## 🐛 Troubleshooting

**Erro: "column pai does not exist"**
- ✅ Corrigido! Execute o script para remover essas colunas

**Erro: "UNIQUE constraint failed: enderecos.cep"**
- ✅ Corrigido! O script remove o UNIQUE constraint

**Erro de conexão ao Supabase**
- Verifique as credenciais no `.env`
- Verifique se o IP está na whitelist do Supabase
- Verifique se `DB_SSL=true` está configurado

## 📚 Estrutura 3FN Final

```
enderecos
├── id (PK)
├── cep
├── logradouro
├── bairro
├── cidade
└── estado

assistidos
├── id (PK)
├── nome
├── data_nascimento
├── sexo
├── cartao_sus
├── rg
├── endereco_id (FK → enderecos.id)
├── numero
├── complemento
└── problemas_saude

contatos_assistido
├── id (PK)
├── assistido_id (FK → assistidos.id)
├── telefone
├── nome_contato
├── parentesco
└── ordem_prioridade

filiacao_assistido
├── id (PK)
├── assistido_id (FK → assistidos.id)
├── tipo (ENUM: 'mae' | 'pai')
└── nome_completo
```
