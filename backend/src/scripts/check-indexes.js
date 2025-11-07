import { sequelize } from '../config/database.js';

async function checkIndexes() {
  try {
    // Lista todos os índices da tabela assistidos
    const [indexes] = await sequelize.query(`
      SELECT * FROM sqlite_master 
      WHERE type = 'index' 
      AND tbl_name = 'assistidos';
    `);
    
    console.log('Índices da tabela assistidos:');
    console.log(JSON.stringify(indexes, null, 2));

    // Lista informações detalhadas dos índices
    const [indexInfo] = await sequelize.query(`
      PRAGMA index_list('assistidos');
    `);
    
    console.log('\nInformações dos índices:');
    console.log(JSON.stringify(indexInfo, null, 2));

    // Para cada índice, mostra as colunas
    for (const index of indexInfo) {
      const [indexColumns] = await sequelize.query(`
        PRAGMA index_info('${index.name}');
      `);
      console.log(`\nColunas do índice ${index.name}:`);
      console.log(JSON.stringify(indexColumns, null, 2));
    }

  } catch (error) {
    console.error('Erro ao verificar índices:', error);
  } finally {
    await sequelize.close();
  }
}

checkIndexes();