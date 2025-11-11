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

async function addMissingColumns() {
  try {
    console.log('🔍 Conectando ao Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Verificar colunas existentes
    console.log('📋 Verificando colunas da tabela assistidos...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'assistidos'
      ORDER BY ordinal_position;
    `);
    
    console.log('Colunas existentes:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    const existingColumns = columns.map(c => c.column_name);
    
    // Lista de colunas que devem existir
    const requiredColumns = [
      { name: 'endereco', type: 'VARCHAR(255)', nullable: true },
      { name: 'contato', type: 'VARCHAR(20)', nullable: true },
      { name: 'contato_emergencia', type: 'VARCHAR(20)', nullable: true }
    ];
    
    console.log('\n🔧 Adicionando colunas faltantes...');
    
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col.name)) {
        console.log(`  ➕ Adicionando coluna: ${col.name}`);
        const nullConstraint = col.nullable ? 'NULL' : 'NOT NULL';
        await sequelize.query(`
          ALTER TABLE assistidos 
          ADD COLUMN ${col.name} ${col.type} ${nullConstraint};
        `);
        console.log(`  ✅ Coluna ${col.name} adicionada com sucesso!`);
      } else {
        console.log(`  ⏭️  Coluna ${col.name} já existe`);
      }
    }
    
    console.log('\n📋 Schema final da tabela assistidos:');
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'assistidos'
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

addMissingColumns();
