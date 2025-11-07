import { sequelize } from '../config/database.js';
import '../models/index.js';

async function verifyDatabase() {
  try {
    // 1. Verifica a estrutura da tabela
    console.log('\nVerificando estrutura da tabela assistidos...');
    const [tableInfo] = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='assistidos';
    `);
    console.log('CREATE TABLE statement:', tableInfo);

    // 2. Lista todas as colunas e suas propriedades
    console.log('\nVerificando colunas da tabela assistidos...');
    const [columns] = await sequelize.query(`
      PRAGMA table_info(assistidos);
    `);
    console.log('Colunas:', columns);

    // 3. Tenta inserir um registro de teste
    console.log('\nTentando inserir um registro de teste...');
    const [result] = await sequelize.query(`
      INSERT INTO assistidos (
        nome, 
        data_nascimento, 
        sexo, 
        cartao_sus, 
        rg, 
        endereco, 
        bairro, 
        cep, 
        cidade, 
        contato, 
        problemas_saude, 
        pai, 
        mae,
        created_at,
        updated_at
      ) VALUES (
        'Teste',
        '2020-01-01',
        'Feminino',
        '123456789012345',
        '12.345.678-9',
        'Rua Teste',
        'Bairro Teste',
        '12345-678',
        'Cidade Teste',
        '(11) 1234-5678',
        'Nenhum',
        'Pai Teste',
        'Mãe Teste',
        datetime('now'),
        datetime('now')
      );
    `);
    console.log('Resultado da inserção:', result);

  } catch (error) {
    console.error('Erro durante a verificação:', error);
  } finally {
    await sequelize.close();
  }
}

verifyDatabase();