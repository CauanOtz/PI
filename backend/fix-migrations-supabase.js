import { sequelize } from './src/config/database.js';
import dotenv from 'dotenv';

// Carregar .env.production
dotenv.config({ path: '.env.production' });

async function fixMigrations() {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✓ Conectado com sucesso!');

    // Verificar se a tabela SequelizeMeta existe
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'SequelizeMeta'
    `);

    if (tables.length === 0) {
      console.log('Criando tabela SequelizeMeta...');
      await sequelize.query(`
        CREATE TABLE "SequelizeMeta" (
          "name" VARCHAR(255) NOT NULL PRIMARY KEY
        )
      `);
      console.log('✓ Tabela SequelizeMeta criada!');
    }

    // Verificar quais tabelas existem
    const [existingTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableNames = existingTables.map(t => t.table_name);
    console.log('\nTabelas existentes:', tableNames.join(', '));

    // Marcar TODAS as migrations antigas como executadas (antes da migration fix)
    const allMigrations = [
      '20250704233744-create-usuarios.cjs',
      '20250716193049-add-cpf-to-usuarios.cjs',
      '20250723000000-create-alunos.cjs',
      '20250728135933-create-documento.cjs',
      '20250729000000-create-aulas.cjs',
      '20250730203400-create-presenca.cjs',
      '20250825000000-create-notificacoes.cjs',
      '20250825000001-create-usuarios-notificacoes.cjs',
      '20250830201803-create-responsavel-aluno.cjs',
      '20250915120000-fix-presencas-unique-indexes.cjs',
      '20250930000100-fix-usuarios-notificacoes-unique.cjs',
      '20251104000000-update-alunos-add-pais-fields.cjs',
      '20251104000000-update-alunos-fields.cjs',
      '20251104000001-rename-alunos-to-assistidos.cjs',
      '20251105000000-create-responsavel-assistido.cjs',
      '20251105000001-update-presencas-aluno-to-assistido.cjs',
      '20251105000002-update-documentos-aluno-to-assistido.cjs',
      '20251105000003-update-presencas-aluno-to-assistido.cjs',
      '20251106223300-remove-responsavel-id-from-assistidos.cjs',
      '20251106223700-remove-responsavel-assistido-table.cjs',
      '20251107000000-rename-aulas-to-atividades.cjs',
      '20251107000000-seed-admin-user.cjs'
    ];

    for (const migration of allMigrations) {
      await sequelize.query(`
        INSERT INTO "SequelizeMeta" (name) 
        VALUES (:migration)
        ON CONFLICT (name) DO NOTHING
      `, {
        replacements: { migration }
      });
      console.log(`✓ Marcada: ${migration}`);
    }

    console.log('\n✓ Todas migrations antigas marcadas!');
    console.log('Agora rode: npm run migrate');
    console.log('Isso executará apenas: 20251110000000-fix-documentos-table.cjs');
    
  } catch (error) {
    console.error('✗ Erro:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixMigrations();
