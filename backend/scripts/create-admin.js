// scripts/create-admin.js
import bcrypt from 'bcrypt';
import { sequelize } from '../src/config/database.js';

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin052174', 10);
    
    await sequelize.query(`
      INSERT INTO usuarios (nome, email, senha, cpf, telefone, role, "createdAt", "updatedAt")
      VALUES (
        'Administrador do Sistema',
        'admin@escola.com',
        :senha,
        '623.920.600-88',
        '(11) 99999-9999',
        'admin',
        datetime('now'),
        datetime('now')
      )
    `, {
      replacements: { senha: hashedPassword }
    });
    
    console.log('Usuário admin criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();