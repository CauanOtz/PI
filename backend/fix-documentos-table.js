import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env.production') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function fixDocumentosTable() {
  try {
    console.log('🔍 Conectando ao Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Verificar colunas existentes na tabela documentos
    console.log('📋 Verificando colunas da tabela documentos...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'documentos'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colunas existentes:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    const existingColumns = columns.map(c => c.column_name);
    
    // Verificar se precisa renomear ou adicionar caminho_arquivo
    if (existingColumns.includes('caminho_arquivo')) {
      console.log('\n✅ Coluna caminho_arquivo já existe!');
    } else if (existingColumns.includes('caminhoArquivo')) {
      console.log('\n✅ Coluna caminhoArquivo já existe (camelCase)!');
    } else {
      console.log('\n➕ Adicionando coluna caminho_arquivo...');
      await sequelize.query(`
        ALTER TABLE documentos 
        ADD COLUMN caminho_arquivo VARCHAR(500) NULL;
      `);
      console.log('✅ Coluna caminho_arquivo adicionada com sucesso!');
    }
    
    // Verificar outras colunas necessárias
    const requiredColumns = [
      { name: 'assistido_id', type: 'INTEGER', nullable: true },
      { name: 'usuario_id', type: 'INTEGER', nullable: true },
      { name: 'ativo', type: 'BOOLEAN', nullable: false, default: true }
    ];
    
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col.name)) {
        console.log(`\n➕ Adicionando coluna ${col.name}...`);
        const defaultValue = col.default !== undefined ? `DEFAULT ${col.default}` : '';
        const nullConstraint = col.nullable ? 'NULL' : 'NOT NULL';
        await sequelize.query(`
          ALTER TABLE documentos 
          ADD COLUMN ${col.name} ${col.type} ${nullConstraint} ${defaultValue};
        `);
        console.log(`✅ Coluna ${col.name} adicionada!`);
      }
    }
    
    console.log('\n📋 Schema final da tabela documentos:');
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'documentos'
      ORDER BY ordinal_position;
    `);
    
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n✅ Processo concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixDocumentosTable();
