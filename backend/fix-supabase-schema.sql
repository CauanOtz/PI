-- Script para atualizar schema do Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Renomear tabela alunos para assistidos
ALTER TABLE alunos RENAME TO assistidos;

-- 2. Renomear tabela aulas para atividades
ALTER TABLE aulas RENAME TO atividades;

-- 3. Atualizar foreign keys na tabela documentos
ALTER TABLE documentos RENAME COLUMN aluno_id TO assistido_id;

-- Atualizar a constraint de foreign key
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS documentos_aluno_id_fkey;
ALTER TABLE documentos ADD CONSTRAINT documentos_assistido_id_fkey 
  FOREIGN KEY (assistido_id) REFERENCES assistidos(id) ON DELETE CASCADE;

-- 4. Atualizar foreign keys na tabela presencas
ALTER TABLE presencas RENAME COLUMN id_aluno TO id_assistido;
ALTER TABLE presencas RENAME COLUMN id_aula TO id_atividade;

-- Atualizar constraints
ALTER TABLE presencas DROP CONSTRAINT IF EXISTS presencas_id_aluno_fkey;
ALTER TABLE presencas DROP CONSTRAINT IF EXISTS presencas_id_aula_fkey;

ALTER TABLE presencas ADD CONSTRAINT presencas_id_assistido_fkey 
  FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE;
  
ALTER TABLE presencas ADD CONSTRAINT presencas_id_atividade_fkey 
  FOREIGN KEY (id_atividade) REFERENCES atividades(id) ON DELETE CASCADE;

-- 5. Atualizar tabela responsaveis_alunos
ALTER TABLE responsaveis_alunos RENAME COLUMN id_aluno TO id_assistido;

ALTER TABLE responsaveis_alunos DROP CONSTRAINT IF EXISTS responsaveis_alunos_id_aluno_fkey;
ALTER TABLE responsaveis_alunos ADD CONSTRAINT responsaveis_alunos_id_assistido_fkey 
  FOREIGN KEY (id_assistido) REFERENCES assistidos(id) ON DELETE CASCADE;

-- 6. Atualizar foreign keys na tabela atividades
ALTER TABLE atividades DROP CONSTRAINT IF EXISTS aulas_responsavel_id_fkey;
ALTER TABLE atividades DROP CONSTRAINT IF EXISTS aulas_professor_id_fkey;

-- Remover colunas responsavel_id e professor_id se existirem
ALTER TABLE atividades DROP COLUMN IF EXISTS responsavel_id;
ALTER TABLE atividades DROP COLUMN IF EXISTS professor_id;

-- 7. Atualizar colunas de timestamp na tabela documentos
-- Remover colunas antigas de timestamp
ALTER TABLE documentos DROP COLUMN IF EXISTS data_upload;
ALTER TABLE documentos DROP COLUMN IF EXISTS data_atualizacao;
ALTER TABLE documentos DROP COLUMN IF EXISTS data_exclusao;

-- Adicionar colunas padrão do Sequelize se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='documentos' AND column_name='createdAt') THEN
    ALTER TABLE documentos ADD COLUMN "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='documentos' AND column_name='updatedAt') THEN
    ALTER TABLE documentos ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- 8. Verificar se a coluna ativo existe, caso contrário adicionar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='documentos' AND column_name='ativo') THEN
    ALTER TABLE documentos ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- 9. Atualizar índices únicos na tabela presencas se necessário
DROP INDEX IF EXISTS unique_presenca_assistido_atividade_data;
CREATE UNIQUE INDEX IF NOT EXISTS unique_presenca_assistido_atividade_data 
  ON presencas(id_assistido, id_atividade, data_registro);

-- Verificação final
SELECT 'Tabelas renomeadas com sucesso!' as status;

-- Listar todas as tabelas para confirmar
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
