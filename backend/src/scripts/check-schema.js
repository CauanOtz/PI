import { sequelize } from '../config/database.js';
import '../models/index.js';

async function checkSchema() {
  try {
    // Verifica a estrutura da tabela
    const [results] = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='assistidos';
    `);
    
    console.log('Estrutura da tabela assistidos:');
    console.log(results);

    // Lista todas as colunas
    const [columns] = await sequelize.query(`
      PRAGMA table_info(assistidos);
    `);
    
    console.log('\nColunas da tabela assistidos:');
    console.log(columns);

  } catch (error) {
    console.error('Erro ao verificar schema:', error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();