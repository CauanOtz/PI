import { sequelize } from './src/config/database.js';
import dotenv from 'dotenv';

// Carregar .env.production
dotenv.config({ path: '.env.production' });

async function applyCepMigration() {
  try {
    console.log('🔄 Conectando ao Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conectado com sucesso!\n');

    // Verificar migrations já executadas
    const [executedMigrations] = await sequelize.query(`
      SELECT name FROM "SequelizeMeta" ORDER BY name
    `);
    
    console.log('📋 Migrations já executadas:');
    executedMigrations.forEach(m => console.log(`  - ${m.name}`));
    console.log('');

    // Verificar se a migration do CEP já foi executada
    const cepMigration = '20251116000000-remove-cep-unique-constraint.cjs';
    const alreadyExecuted = executedMigrations.some(m => m.name === cepMigration);

    if (alreadyExecuted) {
      console.log('⚠️  Migration do CEP já foi executada!');
      await sequelize.close();
      return;
    }

    // Executar a migration do CEP manualmente
    console.log('🔧 Executando migration: remove CEP unique constraint...\n');

    // Backup da tabela
    console.log('1️⃣  Criando backup da tabela enderecos...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS enderecos_backup AS 
      SELECT * FROM enderecos
    `);
    console.log('✅ Backup criado!\n');

    // Criar tabela temporária sem constraint UNIQUE no CEP
    console.log('2️⃣  Criando tabela temporária sem UNIQUE constraint...');
    await sequelize.query(`
      CREATE TABLE enderecos_temp (
        id SERIAL PRIMARY KEY,
        cep VARCHAR(9) NOT NULL,
        logradouro VARCHAR(255) NOT NULL,
        bairro VARCHAR(100) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        estado VARCHAR(2) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Tabela temporária criada!\n');

    // Copiar dados
    console.log('3️⃣  Copiando dados...');
    await sequelize.query(`
      INSERT INTO enderecos_temp (id, cep, logradouro, bairro, cidade, estado, "createdAt", "updatedAt")
      SELECT id, cep, logradouro, bairro, cidade, estado, "createdAt", "updatedAt"
      FROM enderecos
    `);
    console.log('✅ Dados copiados!\n');

    // Atualizar sequence
    console.log('4️⃣  Atualizando sequence...');
    await sequelize.query(`
      SELECT setval('enderecos_temp_id_seq', (SELECT MAX(id) FROM enderecos_temp))
    `);
    console.log('✅ Sequence atualizada!\n');

    // Drop tabela antiga
    console.log('5️⃣  Removendo tabela antiga...');
    await sequelize.query(`DROP TABLE enderecos CASCADE`);
    console.log('✅ Tabela antiga removida!\n');

    // Renomear tabela temporária
    console.log('6️⃣  Renomeando tabela temporária...');
    await sequelize.query(`ALTER TABLE enderecos_temp RENAME TO enderecos`);
    console.log('✅ Tabela renomeada!\n');

    // Renomear sequence
    console.log('7️⃣  Renomeando sequence...');
    await sequelize.query(`ALTER SEQUENCE enderecos_temp_id_seq RENAME TO enderecos_id_seq`);
    console.log('✅ Sequence renomeada!\n');

    // Recriar foreign keys
    console.log('8️⃣  Recriando foreign keys...');
    await sequelize.query(`
      ALTER TABLE assistidos 
      ADD CONSTRAINT assistidos_endereco_id_fkey 
      FOREIGN KEY (endereco_id) 
      REFERENCES enderecos(id) 
      ON UPDATE CASCADE 
      ON DELETE SET NULL
    `);
    console.log('✅ Foreign keys recriadas!\n');

    // Marcar migration como executada
    console.log('9️⃣  Marcando migration como executada...');
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES (:migration)
    `, {
      replacements: { migration: cepMigration }
    });
    console.log('✅ Migration marcada!\n');

    console.log('🎉 Migration do CEP aplicada com sucesso no Supabase!\n');
    console.log('📊 Agora você pode:');
    console.log('   - Criar assistidos com mesmo CEP mas endereços diferentes');
    console.log('   - Endereços idênticos ainda serão compartilhados (Opção 2)\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
    console.log('\n⚠️  Se ocorreu erro, você pode restaurar o backup:');
    console.log('   DROP TABLE enderecos;');
    console.log('   ALTER TABLE enderecos_backup RENAME TO enderecos;');
  } finally {
    await sequelize.close();
  }
}

applyCepMigration();
