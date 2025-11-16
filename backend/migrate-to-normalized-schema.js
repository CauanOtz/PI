import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.production') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function migrateToNormalizedSchema() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🚀 Iniciando migração para schema normalizado...\n');
    
    // ============================================
    // ETAPA 1: Criar novas tabelas
    // ============================================
    console.log('📋 ETAPA 1: Criando novas tabelas...');
    
    // 1.1 Tabela enderecos
    console.log('  → Criando tabela enderecos...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.enderecos (
        id SERIAL PRIMARY KEY,
        cep VARCHAR(9) NOT NULL UNIQUE,
        logradouro VARCHAR(255),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `, { transaction });
    
    // 1.2 Tabela contatos_assistido
    console.log('  → Criando tabela contatos_assistido...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.contatos_assistido (
        id SERIAL PRIMARY KEY,
        assistido_id INTEGER NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
        telefone VARCHAR(20) NOT NULL,
        nome_contato VARCHAR(100),
        parentesco VARCHAR(50),
        observacao VARCHAR(255),
        ordem_prioridade INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT contatos_assistido_telefone_unique UNIQUE (assistido_id, telefone)
      );
    `, { transaction });
    
    // 1.3 Tabela filiacao_assistido
    console.log('  → Criando tabela filiacao_assistido...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.filiacao_assistido (
        id SERIAL PRIMARY KEY,
        assistido_id INTEGER NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('mae', 'pai')),
        nome_completo VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT filiacao_assistido_unique UNIQUE (assistido_id, tipo)
      );
    `, { transaction });
    
    console.log('✅ Tabelas criadas com sucesso!\n');
    
    // ============================================
    // ETAPA 2: Adicionar novas colunas em assistidos
    // ============================================
    console.log('📋 ETAPA 2: Adicionando novas colunas na tabela assistidos...');
    
    await sequelize.query(`
      ALTER TABLE public.assistidos 
      ADD COLUMN IF NOT EXISTS endereco_id INTEGER REFERENCES public.enderecos(id),
      ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
      ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);
    `, { transaction });
    
    console.log('✅ Colunas adicionadas!\n');
    
    // ============================================
    // ETAPA 3: Migrar dados de endereços
    // ============================================
    console.log('📋 ETAPA 3: Migrando dados de endereços...');
    
    const [assistidos] = await sequelize.query(`
      SELECT id, cep, bairro, cidade, endereco 
      FROM assistidos 
      WHERE cep IS NOT NULL AND cep != '';
    `, { transaction });
    
    console.log(`  → Encontrados ${assistidos.length} assistidos com CEP`);
    
    const enderecoMap = new Map();
    
    for (const assistido of assistidos) {
      if (assistido.cep && !enderecoMap.has(assistido.cep)) {
        // Extrair logradouro do campo endereco (antes da vírgula ou número)
        let logradouro = assistido.endereco || '';
        const match = logradouro.match(/^([^,0-9]+)/);
        if (match) {
          logradouro = match[1].trim();
        }
        
        const [result] = await sequelize.query(`
          INSERT INTO enderecos (cep, logradouro, bairro, cidade, created_at, updated_at)
          VALUES (:cep, :logradouro, :bairro, :cidade, NOW(), NOW())
          ON CONFLICT (cep) DO UPDATE SET 
            logradouro = COALESCE(EXCLUDED.logradouro, enderecos.logradouro),
            bairro = COALESCE(EXCLUDED.bairro, enderecos.bairro),
            cidade = COALESCE(EXCLUDED.cidade, enderecos.cidade)
          RETURNING id;
        `, {
          replacements: {
            cep: assistido.cep,
            logradouro: logradouro || null,
            bairro: assistido.bairro || null,
            cidade: assistido.cidade || null
          },
          transaction
        });
        
        enderecoMap.set(assistido.cep, result[0].id);
      }
      
      // Atualizar assistido com endereco_id
      const enderecoId = enderecoMap.get(assistido.cep);
      
      // Extrair número do campo endereco
      let numero = '';
      const numeroMatch = assistido.endereco?.match(/,?\s*(\d+)/);
      if (numeroMatch) {
        numero = numeroMatch[1];
      }
      
      await sequelize.query(`
        UPDATE assistidos 
        SET endereco_id = :enderecoId, 
            numero = :numero
        WHERE id = :id;
      `, {
        replacements: {
          enderecoId,
          numero: numero || null,
          id: assistido.id
        },
        transaction
      });
    }
    
    console.log(`✅ ${enderecoMap.size} endereços únicos criados!\n`);
    
    // ============================================
    // ETAPA 4: Migrar contatos
    // ============================================
    console.log('📋 ETAPA 4: Migrando contatos...');
    
    const [assistidosContatos] = await sequelize.query(`
      SELECT id, contato, contato_emergencia 
      FROM assistidos 
      WHERE contato IS NOT NULL OR contato_emergencia IS NOT NULL;
    `, { transaction });
    
    console.log(`  → Encontrados ${assistidosContatos.length} assistidos com contatos`);
    
    let totalContatos = 0;
    for (const assistido of assistidosContatos) {
      const contatos = [];
      
      if (assistido.contato && assistido.contato.trim()) {
        contatos.push({
          assistido_id: assistido.id,
          telefone: assistido.contato,
          ordem_prioridade: 1
        });
        totalContatos++;
      }
      
      if (assistido.contato_emergencia && assistido.contato_emergencia.trim() && 
          assistido.contato_emergencia !== assistido.contato) {
        contatos.push({
          assistido_id: assistido.id,
          telefone: assistido.contato_emergencia,
          ordem_prioridade: 2,
          observacao: 'Contato de emergência'
        });
        totalContatos++;
      }
      
      for (const contato of contatos) {
        await sequelize.query(`
          INSERT INTO contatos_assistido 
          (assistido_id, telefone, ordem_prioridade, observacao, created_at, updated_at)
          VALUES (:assistido_id, :telefone, :ordem_prioridade, :observacao, NOW(), NOW())
          ON CONFLICT (assistido_id, telefone) DO NOTHING;
        `, {
          replacements: contato,
          transaction
        });
      }
    }
    
    console.log(`✅ ${totalContatos} contatos migrados!\n`);
    
    // ============================================
    // ETAPA 5: Migrar filiação (mãe/pai)
    // ============================================
    console.log('📋 ETAPA 5: Migrando dados de filiação...');
    
    const [assistidosFiliacao] = await sequelize.query(`
      SELECT id, mae, pai 
      FROM assistidos 
      WHERE mae IS NOT NULL OR pai IS NOT NULL;
    `, { transaction });
    
    console.log(`  → Encontrados ${assistidosFiliacao.length} assistidos com filiação`);
    
    let totalFiliacao = 0;
    for (const assistido of assistidosFiliacao) {
      if (assistido.mae && assistido.mae.trim()) {
        await sequelize.query(`
          INSERT INTO filiacao_assistido 
          (assistido_id, tipo, nome_completo, created_at, updated_at)
          VALUES (:assistido_id, 'mae', :nome_completo, NOW(), NOW())
          ON CONFLICT (assistido_id, tipo) DO NOTHING;
        `, {
          replacements: {
            assistido_id: assistido.id,
            nome_completo: assistido.mae
          },
          transaction
        });
        totalFiliacao++;
      }
      
      if (assistido.pai && assistido.pai.trim()) {
        await sequelize.query(`
          INSERT INTO filiacao_assistido 
          (assistido_id, tipo, nome_completo, created_at, updated_at)
          VALUES (:assistido_id, 'pai', :nome_completo, NOW(), NOW())
          ON CONFLICT (assistido_id, tipo) DO NOTHING;
        `, {
          replacements: {
            assistido_id: assistido.id,
            nome_completo: assistido.pai
          },
          transaction
        });
        totalFiliacao++;
      }
    }
    
    console.log(`✅ ${totalFiliacao} registros de filiação criados!\n`);
    
    // ============================================
    // ETAPA 6: Remover colunas antigas
    // ============================================
    console.log('📋 ETAPA 6: Removendo colunas antigas da tabela assistidos...');
    
    await sequelize.query(`
      ALTER TABLE public.assistidos 
      DROP COLUMN IF EXISTS endereco,
      DROP COLUMN IF EXISTS bairro,
      DROP COLUMN IF EXISTS cep,
      DROP COLUMN IF EXISTS cidade,
      DROP COLUMN IF EXISTS contato,
      DROP COLUMN IF EXISTS contato_emergencia,
      DROP COLUMN IF EXISTS pai,
      DROP COLUMN IF EXISTS mae;
    `, { transaction });
    
    console.log('✅ Colunas antigas removidas!\n');
    
    // ============================================
    // ETAPA 7: Criar índices
    // ============================================
    console.log('📋 ETAPA 7: Criando índices para performance...');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_assistidos_nome ON public.assistidos(nome);
      CREATE INDEX IF NOT EXISTS idx_assistidos_endereco ON public.assistidos(endereco_id);
      CREATE INDEX IF NOT EXISTS idx_contatos_assistido ON public.contatos_assistido(assistido_id);
      CREATE INDEX IF NOT EXISTS idx_contatos_prioridade ON public.contatos_assistido(assistido_id, ordem_prioridade);
      CREATE INDEX IF NOT EXISTS idx_filiacao_assistido ON public.filiacao_assistido(assistido_id);
    `, { transaction });
    
    console.log('✅ Índices criados!\n');
    
    // ============================================
    // ETAPA 8: Remover tabelas obsoletas
    // ============================================
    console.log('📋 ETAPA 8: Removendo tabelas obsoletas...');
    
    await sequelize.query(`
      DROP TABLE IF EXISTS public.usuarios_notificacoes CASCADE;
      DROP TABLE IF EXISTS public.notificacoes CASCADE;
      DROP TABLE IF EXISTS public.responsaveis_assistidos CASCADE;
    `, { transaction });
    
    console.log('✅ Tabelas obsoletas removidas!\n');
    
    // ============================================
    // COMMIT
    // ============================================
    await transaction.commit();
    
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📊 Resumo:');
    console.log(`   - Endereços únicos: ${enderecoMap.size}`);
    console.log(`   - Contatos migrados: ${totalContatos}`);
    console.log(`   - Registros de filiação: ${totalFiliacao}`);
    console.log(`   - Tabelas obsoletas removidas: 3`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ ERRO na migração:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

migrateToNormalizedSchema().catch(console.error);
