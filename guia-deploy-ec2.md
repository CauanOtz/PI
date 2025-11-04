# 🚀 Guia Completo de Deploy – Projeto PI (Frontend + Backend) na AWS EC2

## 📘 Sumário
1. [Criação da Instância EC2](#1-criação-da-instância-ec2)
2. [Conexão via Vockey](#2-conexão-via-vockey)
3. [Instalação de Dependências](#3-instalação-de-dependências)
4. [Clonagem do Repositório](#4-clonagem-do-repositório)
5. [Build e Execução do Backend](#5-build-e-execução-do-backend)
6. [Build e Execução do Frontend](#6-build-e-execução-do-frontend)
7. [Configuração das Portas (Segurança EC2)](#7-configuração-das-portas-segurança-ec2)
8. [Comandos Úteis](#8-comandos-úteis)
9. [Verificação Final](#9-verificação-final)

---

## 1️⃣ Criação da Instância EC2

1. Acesse o console da **AWS** → [EC2 Dashboard](https://console.aws.amazon.com/ec2/)
2. Clique em **Executar instância (Launch Instance)**
3. Preencha as opções:
   - **Nome:** `DiarioDeClasse`
   - **Imagem (AMI):** `Amazon Linux 2023`
   - **Tipo de instância:** `t2.micro (gratuito)`
   - **Par de chaves:** selecione `vockey`
   - **Configurações de rede:**
     - Marque “Atribuir IP público automaticamente”
     - Em “Firewall (grupo de segurança)”, crie um novo grupo com:
       - Porta **22** → SSH
       - Porta **80** → HTTP
       - Porta **3001** → Backend
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

Atualize o sistema e instale Docker e Git:

```bash
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
```

> ⚠️ Após isso, **digite `exit` e reconecte via Vockey** para aplicar as permissões do Docker.

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
backend  frontend
```

---

## 5️⃣ Build e Execução do Backend

```bash
cd backend
sudo docker build -t pi-backend:1.0 .
sudo docker run -d --name backend -p 3001:3001 pi-backend:1.0
sudo docker ps
```

Verifique se aparece algo como:
```
pi-backend:1.0   0.0.0.0:3001->3001/tcp
```

---

## 6️⃣ Build e Execução do Frontend

```bash
cd ../frontend
sudo docker build -t pi-frontend:1.0 .
sudo docker run -d --name frontend -p 80:80 pi-frontend:1.0
sudo docker ps
```

Verifique se aparece:
```
pi-frontend:1.0   0.0.0.0:80->80/tcp
```

> 💡 Se precisar, edite o `Dockerfile` do frontend e substitua a linha do `VITE_API_BASE_URL` pelo IP público da sua instância:
> ```dockerfile
> ARG VITE_API_BASE_URL=http://<SEU_IP_PUBLICO>:3001/api/v2
> ```

---

## 7️⃣ Configuração das Portas (Segurança EC2)

1. Acesse o **painel EC2 → Instâncias → Aba Segurança**
2. Clique no **grupo de segurança** (ex: `launch-wizard-2`)
3. Vá em **Editar regras de entrada**
4. Adicione as seguintes regras:

| Tipo | Protocolo | Porta | Origem | Descrição |
|------|-----------|--------|--------|------------|
| SSH | TCP | 22 | 0.0.0.0/0 | Acesso remoto |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend |
| Custom TCP | TCP | 3001 | 0.0.0.0/0 | Backend API |

Depois clique em **Salvar regras** ✅

---

## 8️⃣ Comandos Úteis

| Ação | Comando |
|------|----------|
| Ver containers ativos | `sudo docker ps` |
| Ver logs | `sudo docker logs -f <nome>` |
| Parar container | `sudo docker stop <nome>` |
| Remover container | `sudo docker rm <nome>` |
| Recriar container | `sudo docker restart <nome>` |
| Limpar imagens não usadas | `sudo docker system prune -a -f` |

---

## 9️⃣ Verificação Final

Abra no navegador:

- **Frontend:** `http://<SEU_IP_PUBLICO>`  
  → Deve exibir a tela de login.  
- **Backend (Swagger):** `http://<SEU_IP_PUBLICO>:3001/api-docs`  
  → Deve abrir a interface da API.  

Se ambos abrirem, o deploy foi concluído com sucesso 🎉

---

## 🏁 Créditos

**Projeto Integrador – Diário de Classe**  
Desenvolvido por: *Cauan Otz, Davi Ryan Konuma Lima e equipe*  
Infraestrutura: *AWS EC2 com Docker (Amazon Linux 2023)*  
Repositório: [https://github.com/CauanOtz/PI](https://github.com/CauanOtz/PI)
