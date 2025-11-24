docker --version
docker-compose --version
git clone https://github.com/CauanOtz/PI.git
docker-compose -f docker-compose.aws.yml ps
docker-compose -f docker-compose.aws.yml logs -f backend
docker-compose -f docker-compose.aws.yml logs -f postgres
docker-compose -f docker-compose.aws.yml logs -f frontend
docker-compose -f docker-compose.aws.yml down
docker-compose -f docker-compose.aws.yml up -d
docker-compose -f docker-compose.aws.yml ps
docker-compose -f docker-compose.aws.yml logs postgres
docker exec -it ang-postgres psql -U ang_user -d ang_database -c "SELECT 1;"
docker exec ang-postgres psql -U ang_user -d ang_database -c "SELECT * FROM \"SequelizeMeta\";"
docker-compose -f docker-compose.aws.yml down -v
docker-compose -f docker-compose.aws.yml up -d
docker-compose -f docker-compose.aws.yml logs frontend
docker exec ang-frontend nginx -t
docker-compose -f docker-compose.aws.yml up -d --build frontend
docker stats
docker system df
docker-compose -f docker-compose.aws.yml logs -f --tail=100
# 🚀 Quick Start — Deploy (EC2 + Docker Compose + PostgreSQL)

This guide was updated to be a single, reproducible Quick Start so you can run the whole stack on a fresh EC2 instance without surprises.

Prerequisites (recommended):
- Use **Ubuntu 22.04 LTS** or **Amazon Linux 2023**. If you use Amazon Linux, follow the Amazon Linux commands in the "Package manager" section below.
- Use an instance with at least **2 GB RAM** (e.g. `t3.small` or `t3.medium`) or add swap (see below). Building the frontend on tiny instances (t3.micro) often fails.
- Open the following security group inbound ports: **22 (SSH)**, **8080 (frontend)**, **3001 (backend)**. **Do not** leave port 5432 open in production.

Quick checklist (run these in order on a fresh instance):
1. Connect to the instance (EC2 Instance Connect / vockey).
2. Install Docker, Docker Compose and Git (commands below — choose the OS section).
3. Clone the repo and switch to branch `feature/aws-postgresql-deploy`.
4. Copy `.env.aws.example` to `backend/.env.aws` and edit it with your EC2 public IP.
5. Build and start the stack with Docker Compose.
6. Recreate backend after editing env files (see notes) and rebuild frontend if needed.

---

Package manager quick reference

- Ubuntu (recommended):
```bash
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y git curl docker.io
sudo systemctl enable --now docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker $USER
exit  # reconnect to apply docker group
```

- Amazon Linux 2023:
```bash
sudo dnf update -y
sudo dnf install -y git curl docker
sudo systemctl enable --now docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo usermod -aG docker ec2-user
exit  # reconnect to apply docker group
```

Optional: add 2GB swap if instance RAM is small (temporary):
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
```

---

1) Clone repository and switch branch

```bash
git clone -b feature/aws-postgresql-deploy https://github.com/CauanOtz/PI.git
cd PI
```

2) Configure backend env

```bash
cd backend
cp .env.aws.example .env.aws
# Replace the placeholders with your EC2 public IP (for example 44.192.81.60)
# Edit the CORS/URL lines below: FRONT_ORIGIN, FRONTEND_URL, BACKEND_ORIGIN, SWAGGER_SERVER_URL
nano .env.aws
# Save then exit (Ctrl+O, Enter, Ctrl+X)
cd ..
```

Important: when you change `backend/.env.aws` you must recreate the backend container so it loads the new env.

3) Build & start with Docker Compose

```bash
docker-compose -f docker-compose.aws.yml build --no-cache
docker-compose -f docker-compose.aws.yml up -d
```

4) Confirm services are healthy

```bash
docker-compose -f docker-compose.aws.yml ps
docker-compose -f docker-compose.aws.yml logs -f backend
```

If you updated `backend/.env.aws`, recreate the backend container:
```bash
docker-compose -f docker-compose.aws.yml up -d --no-deps --force-recreate backend
docker exec -it ang-backend printenv | grep -E 'FRONT|CORS|SWAGGER|BACKEND'
```

5) Rebuild frontend only if it was built with the wrong API URL

If the frontend was built pointing to a wrong backend address, rebuild the frontend with the correct backend URL arg and restart:
```bash
docker-compose -f docker-compose.aws.yml build --no-cache frontend
docker-compose -f docker-compose.aws.yml up -d --no-deps --force-recreate frontend
```

6) Health checks and browser

```bash
curl http://localhost:3001/api/v2/health
# In browser: http://<EC2_PUBLIC_IP>:8080  and  http://<EC2_PUBLIC_IP>:3001/api-docs
```

Troubleshooting (most common pitfalls)
- If you see CORS errors, confirm `backend/.env.aws` contains the exact public origin `http://<EC2_PUBLIC_IP>:8080` and recreate backend.
- If `docker-compose` complains about buildx, install a newer Docker Compose (use the curl binary above) or use `docker compose` (space) if available.
- If the frontend build hangs on Vite (transforming) — this usually means low memory on the instance. Use a larger instance (t3.small/t3.medium), add swap, or build frontend locally and push an image.
- To apply env changes: `docker-compose up -d --no-deps --force-recreate backend` (restart does not reload `env_file`).

Security group reminder
- Inbound rules required: 22 (SSH), 8080 (frontend), 3001 (backend). Keep 5432 closed to the world in production.

Admin credentials (seeded):
- Email: `admin@ang.com`
- Password: `Admin@123` (change after first login)

---

If you want, I can now:
- (A) Insert the exact EC2 public IP into `backend/.env.aws` in the repo and push a commit, or
- (B) Provide the exact commands to run on your EC2 to edit the file and recreate the backend and frontend.

---

**Credits**: Project Integrator – Diário de Classe (Cauan Ortiz, Davi Ryan K. Lima, Matheus H. Schopp)
