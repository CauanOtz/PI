# 🚀 Guia Completo de Deploy – Projeto PI (Frontend + Backend + PostgreSQL) na AWS EC2

## 📘 Sumário
1. [Criação da Instância EC2](#1-criação-da-instância-ec2)
2. [Conexão via Vockey](#2-conexão-via-vockey)
3. [Instalação de Dependências](#3-instalação-de-dependências)
4. [Clonagem do Repositório](#4-clonagem-do-repositório)
5. [Configuração do Ambiente](#5-configuração-do-ambiente)
6. [Deploy com Docker Compose](#6-deploy-com-docker-compose)
7. [Configuração das Portas (Segurança EC2)](#7-configuração-das-portas-segurança-ec2)
8. [Comandos Úteis](#8-comandos-úteis)
9. [Verificação Final](#9-verificação-final)
10. [Troubleshooting](#10-troubleshooting)

---

## 1️⃣ Criação da Instância EC2

1. Acesse o console da **AWS** → [EC2 Dashboard](https://console.aws.amazon.com/ec2/)
2. Clique em **Executar instância (Launch Instance)**
3. Preencha as opções:
   - **Nome:** `DiarioDeClasse`
   - **Imagem (AMI):** `AMI do Amazon Linux 2023 kernel-6.1` 
   - **Tipo de instância:** `t3.micro` 
   - **Par de chaves:** selecione `vockey`
   - **Armazenamento:** `20 GB` (para comportar banco de dados e imagens Docker)
   - **Configurações de rede:**
     - Marque "Atribuir IP público automaticamente"
     - Em "Firewall (grupo de segurança)", crie um novo grupo com:
       - Porta **22** → SSH
       - Porta **80** → HTTP
       - Porta **3001** → Backend API
       - Porta **8080** → Frontend
       - Porta **5432** → PostgreSQL (opcional, apenas para debug)
   - Clique em **Executar instância**

4. Após criada, copie o **endereço IPv4 público**, que será usado para acessar o site.

---

## 2️⃣ Conexão via Vockey

1. No painel EC2, selecione a instância → clique em **Conectar**
2. Escolha a aba **Conectar via EC2 Instance Connect (Vockey)**
3. Clique em **Conectar** e aguarde abrir o terminal diretamente no navegador

Pronto! Você já está dentro da sua instância 🎯

---

## 3️⃣ Instalação de Dependências

Atualize o sistema e instale Docker, Docker Compose e Git:

```bash
# Atualizar sistema
sudo apt-get update -y
sudo apt-get upgrade -y

# Instalar dependências básicas
sudo apt-get install -y git curl

# Instalar Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker ubuntu

# Verificar instalações
docker --version
docker-compose --version
```

> ⚠️ Após isso, **digite `exit` e reconecte via Vockey** para aplicar as permissões do Docker.

> 💡 Versões esperadas:
> - Docker: 24.x ou superior
> - Docker Compose: 2.x ou superior

---

## 4️⃣ Clonagem do Repositório

Clone o projeto do GitHub e entre na pasta:

```bash
git clone https://github.com/CauanOtz/PI.git
cd PI
ls
```

Você deve ver:
```
backend  frontend  docker-compose.aws.yml  guia-deploy-ec2.md
```

---

## 5️⃣ Configuração do Ambiente

Crie o arquivo de configuração do backend com as variáveis de ambiente:

```bash
cd backend
cp .env.aws.example .env.aws
```

Edite o arquivo `.env.aws` com suas credenciais (opcional, já vem com valores padrão):

```bash
nano .env.aws
```

Conteúdo padrão do `.env.aws`:
```env
NODE_ENV=production
PORT=3001

# PostgreSQL Database
DB_DIALECT=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ang_database
DB_USER=ang_user
DB_PASSWORD=ang_secure_password_2025

# JWT Secret (ALTERE PARA PRODUÇÃO!)
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2025

# CORS
CORS_ORIGIN=http://localhost:8080
```

> ⚠️ **IMPORTANTE:** Para produção, altere:
> - `DB_PASSWORD` para uma senha forte
> - `JWT_SECRET` para uma chave única e segura
> - `CORS_ORIGIN` para o IP público da sua instância

Exemplo de configuração para produção:
```bash
# Substitua <SEU_IP_PUBLICO> pelo IP da sua instância EC2
sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://<SEU_IP_PUBLICO>:8080|' .env.aws
sed -i 's|JWT_SECRET=.*|JWT_SECRET=$(openssl rand -base64 32)|' .env.aws
sed -i 's|DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -base64 16)|' .env.aws
```

Volte para o diretório raiz:
```bash
cd ..
```

---

## 6️⃣ Deploy com Docker Compose

Agora vamos subir toda a infraestrutura (PostgreSQL + Backend + Frontend) com um único comando:

```bash
# Build das imagens (primeira vez ou quando houver alterações)
docker-compose -f docker-compose.aws.yml build --no-cache

# Subir todos os serviços
docker-compose -f docker-compose.aws.yml up -d

# Verificar se todos os containers estão rodando
docker-compose -f docker-compose.aws.yml ps
```

Você deve ver 3 containers rodando:
```
NAME                IMAGE              STATUS
ang-postgres        postgres:14-alpine Up (healthy)
ang-backend         pi-backend         Up
ang-frontend        pi-frontend        Up
```

### 📋 Verificar Logs

Para acompanhar a inicialização e verificar se as migrações foram aplicadas:

```bash
# Ver logs do backend (migrações + servidor)
docker-compose -f docker-compose.aws.yml logs -f backend

# Ver logs do PostgreSQL
docker-compose -f docker-compose.aws.yml logs -f postgres

# Ver logs do frontend
docker-compose -f docker-compose.aws.yml logs -f frontend
```

Aguarde até ver no log do backend:
```
== 20250101000001-create-usuarios: migrated (0.065s)
== 20250101000002-create-enderecos: migrated (0.027s)
...
== 20250101000009-seed-admin: migrated (0.111s)
Conexão com o banco de dados estabelecida com sucesso.
Servidor rodando na porta 3001
```

> ✅ Quando aparecer "Servidor rodando na porta 3001", o backend está pronto!

### 🔐 Credenciais do Admin

O sistema cria automaticamente um usuário administrador:
- **Email:** `admin@ang.com`
- **Senha:** `Admin@123`

> ⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

---

## 7️⃣ Configuração das Portas (Segurança EC2)

1. Acesse o **painel EC2 → Instâncias → Aba Segurança**
2. Clique no **grupo de segurança** (ex: `launch-wizard-2`)
3. Vá em **Editar regras de entrada**
4. Adicione as seguintes regras:

| Tipo | Protocolo | Porta | Origem | Descrição |
|------|-----------|--------|--------|------------|
| SSH | TCP | 22 | 0.0.0.0/0 | Acesso remoto |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend (opcional) |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Frontend (Nginx) |
| Custom TCP | TCP | 5432 | 0.0.0.0/0 | PostgreSQL (apenas para debug, remover em produção) |

> ⚠️ **Segurança:** A porta 5432 (PostgreSQL) só deve ser liberada temporariamente para debug. Em produção, remova essa regra para evitar exposição do banco de dados.

Depois clique em **Salvar regras** ✅

---

## 8️⃣ Comandos Úteis

### Docker Compose

| Ação | Comando |
|------|----------|
| Ver status dos containers | `docker-compose -f docker-compose.aws.yml ps` |
| Ver logs de todos | `docker-compose -f docker-compose.aws.yml logs -f` |
| Ver logs do backend | `docker-compose -f docker-compose.aws.yml logs -f backend` |
| Ver logs do PostgreSQL | `docker-compose -f docker-compose.aws.yml logs -f postgres` |
| Parar todos os serviços | `docker-compose -f docker-compose.aws.yml down` |
| Reiniciar tudo | `docker-compose -f docker-compose.aws.yml restart` |
| Rebuild e restart | `docker-compose -f docker-compose.aws.yml up -d --build` |

### Banco de Dados

| Ação | Comando |
|------|----------|
| Acessar PostgreSQL CLI | `docker exec -it ang-postgres psql -U ang_user -d ang_database` |
| Listar tabelas | `docker exec ang-postgres psql -U ang_user -d ang_database -c "\dt"` |
| Ver usuários criados | `docker exec ang-postgres psql -U ang_user -d ang_database -c "SELECT id, nome, email, role FROM usuarios;"` |
| Verificar migrações aplicadas | `docker exec ang-postgres psql -U ang_user -d ang_database -c "SELECT name FROM \"SequelizeMeta\" ORDER BY name;"` |

### Manutenção

| Ação | Comando |
|------|----------|
| Limpar volumes (⚠️ apaga dados!) | `docker-compose -f docker-compose.aws.yml down -v` |
| Limpar tudo e reconstruir | `docker-compose -f docker-compose.aws.yml down -v && docker-compose -f docker-compose.aws.yml up -d --build` |
| Ver uso de disco | `docker system df` |
| Limpar cache de build | `docker builder prune -a -f` |

---

## 9️⃣ Verificação Final

### Health Check da API

Primeiro, verifique se a API está respondendo:

```bash
curl http://localhost:3001/api/v2/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-23T...",
  "environment": "production",
  "database": "postgres"
}
```

### Acessar pelo Navegador

Abra no navegador (substitua `<SEU_IP_PUBLICO>` pelo IP da sua instância):

- **Frontend:** `http://<SEU_IP_PUBLICO>:8080`  
  → Deve exibir a tela de login do sistema.
  
- **Backend (Health):** `http://<SEU_IP_PUBLICO>:3001/api/v2/health`  
  → Deve retornar o JSON de status.
  
- **Backend (Swagger):** `http://<SEU_IP_PUBLICO>:3001/api-docs`  
  → Deve abrir a documentação interativa da API.

### Testar Login

1. Acesse o frontend: `http://<SEU_IP_PUBLICO>:8080`
2. Faça login com as credenciais padrão:
   - **Email:** `admin@ang.com`
   - **Senha:** `Admin@123`
3. Se entrar no sistema, o deploy foi concluído com sucesso! 🎉

---

## 🔟 Troubleshooting

### Problema: Containers não iniciam

```bash
# Ver logs detalhados
docker-compose -f docker-compose.aws.yml logs

# Recriar containers
docker-compose -f docker-compose.aws.yml down
docker-compose -f docker-compose.aws.yml up -d
```

### Problema: Erro de conexão com o banco

```bash
# Verificar se o PostgreSQL está saudável
docker-compose -f docker-compose.aws.yml ps

# Ver logs do PostgreSQL
docker-compose -f docker-compose.aws.yml logs postgres

# Testar conexão manualmente
docker exec -it ang-postgres psql -U ang_user -d ang_database -c "SELECT 1;"
```

### Problema: Migrações não aplicadas

```bash
# Ver quais migrações foram aplicadas
docker exec ang-postgres psql -U ang_user -d ang_database -c "SELECT * FROM \"SequelizeMeta\";"

# Recriar banco (⚠️ apaga todos os dados!)
docker-compose -f docker-compose.aws.yml down -v
docker-compose -f docker-compose.aws.yml up -d
```

### Problema: Frontend não carrega

```bash
# Verificar logs do frontend
docker-compose -f docker-compose.aws.yml logs frontend

# Verificar se o Nginx está rodando
docker exec ang-frontend nginx -t

# Rebuild do frontend
docker-compose -f docker-compose.aws.yml up -d --build frontend
```

### Problema: CORS Error

Edite o arquivo `backend/.env.aws` e atualize a variável `CORS_ORIGIN`:

```bash
cd backend
nano .env.aws
# Altere: CORS_ORIGIN=http://<SEU_IP_PUBLICO>:8080
```

Depois reinicie o backend:
```bash
cd ..
docker-compose -f docker-compose.aws.yml restart backend
```

### Monitoramento de Recursos

```bash
# Ver uso de CPU/RAM dos containers
docker stats

# Ver uso de disco
docker system df

# Ver logs em tempo real
docker-compose -f docker-compose.aws.yml logs -f --tail=100
```

---

## 🏁 Créditos

**Projeto Integrador – Diário de Classe**  
Desenvolvido por: *Cauan Ortiz, Davi Ryan Konuma Lima e Matheus Henrique Schopp*  
Infraestrutura: *AWS EC2 com Docker Compose + PostgreSQL (Ubuntu 22.04)*  
Repositório: [https://github.com/CauanOtz/PI](https://github.com/CauanOtz/PI)

### Stack Tecnológica

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Nginx
- **Backend:** Node.js 20 + Express + Sequelize ORM + JWT
- **Banco de Dados:** PostgreSQL 14 Alpine
- **Containerização:** Docker + Docker Compose
- **Cloud:** AWS EC2 (Ubuntu 22.04 LTS)
- **CI/CD:** Docker multi-stage builds
