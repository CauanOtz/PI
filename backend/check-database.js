// Script para verificar e preparar o banco para migração
import { sequelize } from './src/config/database.js';

async function checkDatabase() {
  try {
    // Verificar se a tabela presencas existe e sua estrutura
    const [presencasInfo] = await sequelize.query(`
      PRAGMA table_info(presencas);
    `);
    
    console.log('Estrutura da tabela presencas:');
    console.log(presencasInfo);
    
    // Verificar se a tabela aulas existe
    const [aulasCheck] = await sequelize.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='aulas';
    `);
    
    console.log('\nTabela aulas existe:', aulasCheck.length > 0);
    
    // Verificar se a tabela atividades existe
    const [atividadesCheck] = await sequelize.query(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='atividades';
    `);
    
    console.log('Tabela atividades existe:', atividadesCheck.length > 0);
    
    // Listar todas as tabelas
    const [tables] = await sequelize.query(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
    `);
    
    console.log('\nTabelas no banco de dados:');
    tables.forEach(t => console.log(`- ${t.name}`));
    
  } catch (error) {
    console.error('Erro ao verificar banco:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
