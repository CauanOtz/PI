import { sequelize } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function verifySupabaseSchema() {
  try {
    console.log('📊 Verificando schema final do SUPABASE...\n');
    await sequelize.authenticate();

    const [tables] = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('✅ Tabelas no SUPABASE:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    console.log('\n📋 Estrutura da tabela ASSISTIDOS:\n');
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name='assistidos'
      ORDER BY ordinal_position
    `);
    
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
    });

    await sequelize.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verifySupabaseSchema();
