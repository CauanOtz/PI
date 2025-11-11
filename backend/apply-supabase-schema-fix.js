import { sequelize } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function fixSupabaseSchema() {
  try {
    console.log('🔄 Conectando ao Supabase...');
    await sequelize.authenticate();
    console.log('✓ Conectado com sucesso!\n');

    console.log('📋 Executando alterações de schema...\n');

    // 1. Renomear tabelas
    console.log('1. Renomeando tabela alunos → assistidos...');
    await sequelize.query('ALTER TABLE alunos RENAME TO assistidos');
    console.log('✓ Tabela alunos renomeada para assistidos\n');

    console.log('2. Renomeando tabela aulas → atividades...');
    await sequelize.query('ALTER TABLE aulas RENAME TO atividades');
    console.log('✓ Tabela aulas renomeada para atividades\n');

    // 2. Atualizar tabela documentos
    console.log('3. Atualizando tabela documentos...');
    
    await sequelize.query('ALTER TABLE documentos RENAME COLUMN aluno_id TO assistido_id');
    console.log('✓ Coluna aluno_id → assistido_id');
    
    await sequelize.query('ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_aluno_id_fkey');
    await sequelize.query(`
      ALTER TABLE documentos ADD CONSTRAINT documentos_assistido_id_fkey 
      FOREIGN KEY (assistido_id) REFERENCES assistidos(id) ON DELETE CASCADE
    `);
    console.log('✓ Foreign key atualizada');
    
    // Remover colunas antigas de timestamp
    await sequelize.query('ALTER TABLE documentos DROP COLUMN IF EXISTS data_upload');
    await sequelize.query('ALTER TABLE documentos DROP COLUMN IF EXISTS data_atualizacao');
    await sequelize.query('ALTER TABLE documentos DROP COLUMN IF EXISTS data_exclusao');
    console.log('✓ Colunas de timestamp antigas removidas');
    
    // Adicionar colunas novas
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='documentos' AND column_name='createdAt') THEN
          ALTER TABLE documentos ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='documentos' AND column_name='updatedAt') THEN
          ALTER TABLE documentos ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='documentos' AND column_name='ativo') THEN
          ALTER TABLE documentos ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT true;
        END IF;
      END $$;
    `);
    console.log('✓ Novas colunas adicionadas (createdAt, updatedAt, ativo)\n');

    // 3. Atualizar tabela presencas
    console.log('4. Atualizando tabela presencas...');
    
    await sequelize.query('ALTER TABLE presencas RENAME COLUMN id_aluno TO id_assistido');
    await sequelize.query('ALTER TABLE presencas RENAME COLUMN id_aula TO id_atividade');
    console.log('✓ Colunas renomeadas: id_aluno → id_assistido, id_aula → id_atividade');
    
    await sequelize.query('ALTER TABLE presencas DROP CONSTRAINT IF EXISTS presencas_id_aluno_fkey');
    await sequelize.query('ALTER TABLE presencas DROP CONSTRAINT IF EXISTS presencas_id_aula_fkey');
    
    await sequelize.query(`
      ALTER TABLE presencas ADD CONSTRAINT presencas_id_assistido_fkey 
      FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE
    `);
    await sequelize.query(`
      ALTER TABLE presencas ADD CONSTRAINT presencas_id_atividade_fkey 
      FOREIGN KEY (id_atividade) REFERENCES atividades(id) ON DELETE CASCADE
    `);
    console.log('✓ Foreign keys atualizadas\n');

    // 4. Atualizar tabela responsaveis_alunos
    console.log('5. Atualizando tabela responsaveis_alunos...');
    
    await sequelize.query('ALTER TABLE responsaveis_alunos RENAME COLUMN id_aluno TO id_assistido');
    console.log('✓ Coluna renomeada: id_aluno → id_assistido');
    
    await sequelize.query('ALTER TABLE responsaveis_alunos DROP CONSTRAINT IF EXISTS responsaveis_alunos_id_aluno_fkey');
    await sequelize.query(`
      ALTER TABLE responsaveis_alunos ADD CONSTRAINT responsaveis_alunos_id_assistido_fkey 
      FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE
    `);
    console.log('✓ Foreign key atualizada\n');

    // 5. Limpar atividades
    console.log('6. Limpando tabela atividades...');
    
    await sequelize.query('ALTER TABLE atividades DROP CONSTRAINT IF EXISTS aulas_responsavel_id_fkey');
    await sequelize.query('ALTER TABLE atividades DROP CONSTRAINT IF EXISTS aulas_professor_id_fkey');
    await sequelize.query('ALTER TABLE atividades DROP COLUMN IF EXISTS responsavel_id');
    await sequelize.query('ALTER TABLE atividades DROP COLUMN IF EXISTS professor_id');
    console.log('✓ Colunas desnecessárias removidas\n');

    // 6. Atualizar índices
    console.log('7. Atualizando índices...');
    await sequelize.query('DROP INDEX IF EXISTS unique_presenca_assistido_atividade_data');
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_assistido_atividade_data 
      ON presencas(id_assistido, id_atividade, data_registro)
    `);
    console.log('✓ Índices atualizados\n');

    // Verificação final
    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas após migração:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
    console.log('\n✅ Schema do Supabase atualizado com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro ao atualizar schema:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixSupabaseSchema();
