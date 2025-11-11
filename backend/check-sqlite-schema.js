import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'dev.sqlite'),
  logging: false
});

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
      
      const [columns] = await sequelize.query(`PRAGMA table_info("${table.name}")`);
      console.log(`\n📌 ${table.name.toUpperCase()}:`);
      columns.forEach(col => {
        console.log(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });
    }

    await sequelize.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  }
}

verifyLocalSchema();
