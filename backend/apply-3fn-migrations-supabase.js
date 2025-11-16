/**
 * Script para aplicar todas as migrações 3FN ao banco de dados Supabase
 * 
 * Este script aplica as migrações necessárias para normalizar o banco de dados:
 * 1. Cria tabela enderecos
 * 2. Cria tabela contatos_assistido
 * 3. Cria tabela filiacao_assistido
 * 4. Remove colunas pai e mae da tabela assistidos
 * 5. Adiciona coluna endereco_id à tabela assistidos
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente de produção
dotenv.config({ path: join(__dirname, '.env.production') });

const { Client } = pg;

// Usar DATABASE_URL do Supabase ou configuração individual
let DB_CONFIG;

if (process.env.DATABASE_URL) {
  // Parsear DATABASE_URL do Supabase
  // Formato: postgresql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
  DB_CONFIG = {
    host: url.hostname,
    port: url.port || 5432,
    database: url.pathname.slice(1), // Remove o / inicial
    user: url.username,
    password: url.password,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
} else {
  // Fallback para configuração individual
  DB_CONFIG = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

console.log('🔵 Conectando ao Supabase...');
console.log(`Host: ${DB_CONFIG.host}`);
console.log(`Database: ${DB_CONFIG.database}`);
console.log(`User: ${DB_CONFIG.user}`);

const client = new Client(DB_CONFIG);

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados Supabase\n');

    // ========================================
    // 1. Criar tabela enderecos
    // ========================================
    console.log('📋 Passo 1: Criando tabela enderecos...');
    const enderecoTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'enderecos'
      );
    `);

    if (!enderecoTableExists.rows[0].exists) {
      await client.query(`
        CREATE SEQUENCE IF NOT EXISTS enderecos_id_seq;
        
        CREATE TABLE public.enderecos (
          id INTEGER NOT NULL DEFAULT nextval('enderecos_id_seq'::regclass),
          cep VARCHAR(9) NOT NULL,
          logradouro VARCHAR(255),
          bairro VARCHAR(100),
          cidade VARCHAR(100),
          estado VARCHAR(2),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          CONSTRAINT enderecos_pkey PRIMARY KEY (id)
        );
      `);
      console.log('✅ Tabela enderecos criada com sucesso');
    } else {
      console.log('⚠️  Tabela enderecos já existe, pulando...');
    }

    // ========================================
    // 2. Criar tabela contatos_assistido
    // ========================================
    console.log('\n📋 Passo 2: Criando tabela contatos_assistido...');
    const contatoTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contatos_assistido'
      );
    `);

    if (!contatoTableExists.rows[0].exists) {
      await client.query(`
        CREATE SEQUENCE IF NOT EXISTS contatos_assistido_id_seq;
        
        CREATE TABLE public.contatos_assistido (
          id INTEGER NOT NULL DEFAULT nextval('contatos_assistido_id_seq'::regclass),
          assistido_id INTEGER NOT NULL,
          telefone VARCHAR(20) NOT NULL,
          nome_contato VARCHAR(100),
          parentesco VARCHAR(50),
          observacao VARCHAR(255),
          ordem_prioridade INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          CONSTRAINT contatos_assistido_pkey PRIMARY KEY (id),
          CONSTRAINT contatos_assistido_assistido_id_fkey FOREIGN KEY (assistido_id) 
            REFERENCES public.assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE UNIQUE INDEX contatos_assistido_telefone_unique 
          ON public.contatos_assistido (assistido_id, telefone);
      `);
      console.log('✅ Tabela contatos_assistido criada com sucesso');
    } else {
      console.log('⚠️  Tabela contatos_assistido já existe, pulando...');
    }

    // ========================================
    // 3. Criar tabela filiacao_assistido
    // ========================================
    console.log('\n📋 Passo 3: Criando tabela filiacao_assistido...');
    const filiacaoTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'filiacao_assistido'
      );
    `);

    if (!filiacaoTableExists.rows[0].exists) {
      // Criar ENUM type se não existir
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE filiacao_tipo_enum AS ENUM ('mae', 'pai');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await client.query(`
        CREATE SEQUENCE IF NOT EXISTS filiacao_assistido_id_seq;
        
        CREATE TABLE public.filiacao_assistido (
          id INTEGER NOT NULL DEFAULT nextval('filiacao_assistido_id_seq'::regclass),
          assistido_id INTEGER NOT NULL,
          tipo filiacao_tipo_enum NOT NULL,
          nome_completo VARCHAR(100) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          CONSTRAINT filiacao_assistido_pkey PRIMARY KEY (id),
          CONSTRAINT filiacao_assistido_assistido_id_fkey FOREIGN KEY (assistido_id) 
            REFERENCES public.assistidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT filiacao_assistido_tipo_check CHECK (tipo::text = ANY (ARRAY['mae'::character varying, 'pai'::character varying]::text[]))
        );
        
        CREATE UNIQUE INDEX filiacao_assistido_unique 
          ON public.filiacao_assistido (assistido_id, tipo);
      `);
      console.log('✅ Tabela filiacao_assistido criada com sucesso');
    } else {
      console.log('⚠️  Tabela filiacao_assistido já existe, pulando...');
    }

    // ========================================
    // 4. Adicionar coluna endereco_id à assistidos
    // ========================================
    console.log('\n📋 Passo 4: Adicionando coluna endereco_id à tabela assistidos...');
    const enderecoIdExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'assistidos' 
        AND column_name = 'endereco_id'
      );
    `);

    if (!enderecoIdExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE public.assistidos 
        ADD COLUMN endereco_id INTEGER,
        ADD CONSTRAINT assistidos_endereco_id_fkey 
          FOREIGN KEY (endereco_id) REFERENCES public.enderecos(id) 
          ON DELETE SET NULL ON UPDATE CASCADE;
      `);
      console.log('✅ Coluna endereco_id adicionada com sucesso');
    } else {
      console.log('⚠️  Coluna endereco_id já existe, pulando...');
    }

    // Adicionar colunas numero e complemento se não existirem
    const numeroExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'assistidos' 
        AND column_name = 'numero'
      );
    `);

    if (!numeroExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE public.assistidos 
        ADD COLUMN numero VARCHAR(20),
        ADD COLUMN complemento VARCHAR(100);
      `);
      console.log('✅ Colunas numero e complemento adicionadas');
    } else {
      console.log('⚠️  Colunas numero e complemento já existem');
    }

    // ========================================
    // 5. Remover colunas pai e mae da assistidos
    // ========================================
    console.log('\n📋 Passo 5: Removendo colunas pai e mae da tabela assistidos...');
    const paiExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'assistidos' 
        AND column_name = 'pai'
      );
    `);

    if (paiExists.rows[0].exists) {
      await client.query(`
        ALTER TABLE public.assistidos 
        DROP COLUMN IF EXISTS pai,
        DROP COLUMN IF EXISTS mae;
      `);
      console.log('✅ Colunas pai e mae removidas com sucesso');
    } else {
      console.log('⚠️  Colunas pai e mae já foram removidas, pulando...');
    }

    // ========================================
    // 6. Remover UNIQUE constraint do CEP (se existir)
    // ========================================
    console.log('\n📋 Passo 6: Removendo UNIQUE constraint do CEP...');
    const cepConstraint = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
      AND table_name = 'enderecos' 
      AND constraint_type = 'UNIQUE' 
      AND constraint_name LIKE '%cep%';
    `);

    if (cepConstraint.rows.length > 0) {
      const constraintName = cepConstraint.rows[0].constraint_name;
      await client.query(`ALTER TABLE public.enderecos DROP CONSTRAINT IF EXISTS ${constraintName};`);
      console.log(`✅ UNIQUE constraint '${constraintName}' removida do CEP`);
    } else {
      console.log('⚠️  Nenhuma UNIQUE constraint no CEP encontrada');
    }

    // ========================================
    // 7. Registrar migrações no SequelizeMeta
    // ========================================
    console.log('\n📋 Passo 7: Registrando migrações no SequelizeMeta...');
    
    const migrations = [
      '20251111000001-create-enderecos.cjs',
      '20251111000002-create-contatos-assistido.cjs',
      '20251111000003-create-filiacao-assistido.cjs',
      '20251116000000-remove-cep-unique-constraint.cjs'
    ];

    for (const migration of migrations) {
      const exists = await client.query(
        `SELECT * FROM "SequelizeMeta" WHERE name = $1`,
        [migration]
      );
      
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO "SequelizeMeta" (name) VALUES ($1)`,
          [migration]
        );
        console.log(`✅ Migração ${migration} registrada`);
      } else {
        console.log(`⚠️  Migração ${migration} já estava registrada`);
      }
    }

    console.log('\n✅ TODAS AS MIGRAÇÕES 3FN APLICADAS COM SUCESSO!\n');
    console.log('📊 Estrutura final do banco:');
    console.log('   ✓ enderecos (cep, logradouro, bairro, cidade, estado)');
    console.log('   ✓ assistidos (endereco_id FK, numero, complemento)');
    console.log('   ✓ contatos_assistido (assistido_id FK, telefone, nome_contato, parentesco)');
    console.log('   ✓ filiacao_assistido (assistido_id FK, tipo [mae/pai], nome_completo)');
    console.log('\n🎉 Banco de dados está agora em 3FN (Third Normal Form)!');

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migrações:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado do banco de dados');
  }
}

// Executar migração
runMigration()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
