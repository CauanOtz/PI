import { sequelize } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function updateAssistidosTable() {
  try {
    console.log('🔄 Atualizando tabela assistidos no Supabase...\n');
    await sequelize.authenticate();

    // Adicionar colunas faltantes na tabela assistidos
    const columnsToAdd = [
      { name: 'data_nascimento', type: 'DATE' },
      { name: 'sexo', type: 'VARCHAR(10)' },
      { name: 'cartao_sus', type: 'VARCHAR(20)' },
      { name: 'rg', type: 'VARCHAR(20)' },
      { name: 'bairro', type: 'VARCHAR(100)' },
      { name: 'cep', type: 'VARCHAR(9)' },
      { name: 'cidade', type: 'VARCHAR(100)' },
      { name: 'problemas_saude', type: 'VARCHAR(1000)' },
      { name: 'pai', type: 'VARCHAR(100)' },
      { name: 'mae', type: 'VARCHAR(100)' }
    ];

    for (const col of columnsToAdd) {
      try {
        // Verificar se a coluna existe
        const [exists] = await sequelize.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='assistidos' AND column_name='${col.name}'
        `);

        if (exists.length === 0) {
          console.log(`Adicionando coluna: ${col.name}...`);
          await sequelize.query(`ALTER TABLE assistidos ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✓ Coluna ${col.name} adicionada`);
        } else {
          console.log(`⊙ Coluna ${col.name} já existe`);
        }
      } catch (err) {
        console.error(`✗ Erro ao adicionar ${col.name}:`, err.message);
      }
    }

    // Atualizar constraint de idade se necessário
    try {
      console.log('\nAtualizando constraints...');
      await sequelize.query(`
        ALTER TABLE assistidos DROP CONSTRAINT IF EXISTS assistidos_idade_check
      `);
      console.log('✓ Constraint de idade removida (se existia)');
    } catch (err) {
      console.log('⊙ Constraint não precisou ser removida');
    }

    // Renomear tabela responsaveis_alunos se ainda não foi
    try {
      console.log('\nVerificando tabela responsaveis...');
      const [tables] = await sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema='public' AND table_name IN ('responsaveis_alunos', 'responsaveis_assistidos')
      `);
      
      const hasOldName = tables.some(t => t.table_name === 'responsaveis_alunos');
      const hasNewName = tables.some(t => t.table_name === 'responsaveis_assistidos');
      
      if (hasOldName && !hasNewName) {
        console.log('Renomeando responsaveis_alunos → responsaveis_assistidos...');
        await sequelize.query('ALTER TABLE responsaveis_alunos RENAME TO responsaveis_assistidos');
        console.log('✓ Tabela renomeada');
      } else if (hasNewName) {
        console.log('⊙ Tabela responsaveis_assistidos já existe');
      }
    } catch (err) {
      console.error('✗ Erro ao renomear tabela:', err.message);
    }

    console.log('\n✅ Tabela assistidos atualizada com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

updateAssistidosTable();
