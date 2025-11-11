import { sequelize } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function verifyLocalSchema() {
  try {
    console.log('📊 Verificando schema do banco LOCAL (SQLite)...\n');
    await sequelize.authenticate();

    const [tables] = await sequelize.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name
    `);

    console.log('✅ Tabelas no banco LOCAL:');
    tables.forEach(t => console.log(`  - ${t.name}`));

    console.log('\n📋 Estrutura detalhada:\n');

    for (const table of tables) {
      if (table.name === 'SequelizeMeta') continue;
      
      const [columns] = await sequelize.query(`PRAGMA table_info(${table.name})`);
      console.log(`\n📌 ${table.name.toUpperCase()}:`);
      columns.forEach(col => {
        console.log(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });
    }

    await sequelize.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verifyLocalSchema();
