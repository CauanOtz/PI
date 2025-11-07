import { sequelize } from './src/config/database.js';

async function markMigration() {
  try {
    // Marcar migrations como executadas
    const migrations = [
      '20251105000001-update-presencas-aluno-to-assistido.cjs',
      '20251105000003-update-presencas-aluno-to-assistido.cjs'
    ];
    
    for (const name of migrations) {
      try {
        await sequelize.query(`INSERT INTO SequelizeMeta (name) VALUES ('${name}')`);
        console.log(`✓ Marcada: ${name}`);
      } catch (e) {
        if (e.message.includes('UNIQUE')) {
          console.log(`- Já existe: ${name}`);
        } else {
          console.error(`✗ Erro em ${name}:`, e.message);
        }
      }
    }
    
    console.log('\nTodas as migrações foram processadas!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sequelize.close();
  }
}

markMigration();
