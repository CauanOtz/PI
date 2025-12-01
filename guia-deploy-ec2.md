# 🚀 Guia Rápido — Deploy (EC2 + Docker Compose + PostgreSQL)

Este guia fornece passos reprodutíveis para executar toda a stack em uma instância EC2 recém-criada.

Pré-requisitos (recomendado):
- Use **Ubuntu 22.04 LTS** ou **Amazon Linux 2023**. Para Amazon Linux, veja a seção específica abaixo.
- Instância com pelo menos **2 GB RAM** (ex.: `t3.small` ou `t3.medium`) ou adicione swap. Builds do frontend em instâncias muito pequenas (t3.micro) frequentemente falham.
- Abra as portas do security group: **22 (SSH)**, **8080 (frontend)**, **3001 (backend)**. Não deixe **5432** aberto ao público.

Checklist (executar nesta ordem numa instância limpa):
1. Conecte-se à instância (EC2 Instance Connect / chave SSH).
2. Instale Docker, Docker Compose e Git (comandos abaixo — escolha a seção do SO).
3. Clone o repositório e troque para a branch `feature/aws-postgresql-deploy`.
4. Copie `.env.aws.example` para `backend/.env.aws` e edite com o IP público da instância (Elastic IP recomendado).
5. Build e start com Docker Compose.
6. Se alterar env, recrie o container do backend e, se necessário, reconstrua o frontend.

---

Instalação rápida (exemplos)

- Ubuntu (recomendado):

```powershell
sudo apt-get update -y; sudo apt-get upgrade -y
sudo apt-get install -y git curl docker.io
sudo systemctl enable --now docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
exit  # reconecte para aplicar a nova group membership
```

- Amazon Linux 2023:

```powershell
sudo dnf update -y; sudo dnf install -y git curl docker
sudo systemctl enable --now docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker ec2-user
exit  # reconecte para aplicar a nova group membership
```

Adicionar swap temporário (se RAM for limitada):

```powershell
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

---

1) Clonar repositório e mudar branch

```bash
git clone -b feature/aws-postgresql-deploy https://github.com/CauanOtz/PI.git
cd PI
```

2) Configurar env do backend

```bash
cd backend
cp .env.aws.example .env.aws
# Edite as linhas de CORS/URL: FRONT_ORIGIN, FRONTEND_URL, BACKEND_ORIGIN, SWAGGER_SERVER_URL
nano .env.aws
# Salve e saia (Ctrl+O, Enter, Ctrl+X)
cd ..
```

Importante: após alterar `backend/.env.aws` é necessário recriar o container do backend para que o novo `env_file` seja carregado.

3) Build e start com Docker Compose

```bash
docker-compose -f docker-compose.aws.yml build --no-cache
docker-compose -f docker-compose.aws.yml up -d
```

4) Verificar serviços

```bash
docker-compose -f docker-compose.aws.yml ps
docker-compose -f docker-compose.aws.yml logs -f backend
```

Se você atualizou `backend/.env.aws`, recrie apenas o backend:

```bash
docker-compose -f docker-compose.aws.yml up -d --no-deps --force-recreate backend
docker exec -it ang-backend printenv | grep -E 'FRONT|CORS|SWAGGER|BACKEND'
```

5) Rebuild do frontend (apenas se for necessário)

Se o frontend foi construído com a URL da API errada, reconstrua e reinicie apenas o frontend:

```bash
docker-compose -f docker-compose.aws.yml build --no-cache frontend
docker-compose -f docker-compose.aws.yml up -d --no-deps --force-recreate frontend
```

6) Health checks e acesso pelo navegador

```bash
curl http://localhost:3001/api/v2/health
# No navegador: http://<EC2_PUBLIC_IP>:8080  e  http://<EC2_PUBLIC_IP>:3001/api-docs
```

Diagnóstico — problemas comuns
- CORS: verifique `backend/.env.aws` e confirme que `FRONT_ORIGIN` ou `FRONTEND_URL` contém exatamente `http://<EC2_PUBLIC_IP>:8080`. Depois, recrie o container do backend.
- docker-compose/buildx: se houver erro sobre buildx, instale a versão mais recente do Docker Compose (via curl acima) ou use `docker compose` (com espaço) se disponível.
- Vite travando em "transforming": sinal de memória insuficiente. Soluções: usar instância maior (t3.small/medium), adicionar swap ou construir o frontend localmente e enviar a imagem pronta.
- Aplicar alterações de env: use `docker-compose up -d --no-deps --force-recreate backend` (restart não recarrega `env_file`).

Comandos úteis (diagnóstico):

```bash
docker --version
docker-compose --version
docker-compose -f docker-compose.aws.yml ps
docker-compose -f docker-compose.aws.yml logs -f backend
docker-compose -f docker-compose.aws.yml logs -f postgres
docker-compose -f docker-compose.aws.yml logs -f frontend
docker exec -it ang-postgres psql -U ang_user -d ang_database -c "SELECT 1;"
docker exec ang-postgres psql -U ang_user -d ang_database -c "SELECT * FROM \"SequelizeMeta\";"
docker stats
docker system df
```

Segurança — regras do security group
- Regras inbound mínimas: 22 (SSH), 8080 (frontend), 3001 (backend). Mantenha 5432 fechado ao mundo.

Credenciais admin (seed):
- Email: `admin@ang.com`
- Password: `Admin@123` (troque após o primeiro login)

---

Próximos passos que eu posso ajudar a executar:
- (A) Inserir o IP público exato da instância em `backend/.env.aws` no repositório e commitar (preciso da sua confirmação e do IP).
- (B) Fornecer um script de cópia/edição + os comandos exatos para você executar na instância EC2 (recomendado sem expor o IP no repo).

**Créditos**: Projeto Integrator – Diário de Classe (Cauan Ortiz, Davi Ryan K. Lima, Matheus H. Schopp)

