import { unlinkSync } from 'fs';
import { execSync } from 'child_process';

try {
    // Remove o banco de dados SQLite
    console.log('Removendo banco de dados antigo...');
    unlinkSync('dev.sqlite');
    console.log('Banco de dados removido com sucesso.');
} catch (err) {
    if (err.code !== 'ENOENT') {
        console.error('Erro ao remover banco de dados:', err);
        process.exit(1);
    }
    console.log('Banco de dados não existia, continuando...');
}

try {
    // Executa todas as migrações
    console.log('Executando migrações...');
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    console.log('Migrações executadas com sucesso.');
} catch (err) {
    console.error('Erro ao executar migrações:', err);
    process.exit(1);
}