# Projeto –  Diário de Classe ANG

## Integrantes do Grupo
- Cauan Ortiz – Email: cauanortiz2019@gmail.com
- Davi Ryan Konuma Lima – Email: davirkl07@gmail.com
- Matheus Henrique Schopp Peixoto – Email: mthenriquepeixoto@gmail.com


# Visão Geral do Projeto

**Descrição curta:**  
> O "Diário de Classe ANG" visa digitalizar o gerenciamento de informações e registros de presença da Associação Nova Geração (ANG), que atende crianças no contraturno escolar em Sorocaba/SP.

**Objetivo principal:**  
- O objetivo deste projeto é desenvolver e implantar o 'Diário de Classe ANG', um sistema de gestão digital projetado para substituir os atuais registros manuais em papel. A aplicação visa centralizar e digitalizar os dados cadastrais dos assistidos e o processo de chamada, garantindo a integridade das informações e agilizando a rotina administrativa e pedagógica da instituição.

**Tecnologias utilizadas:**
- **Linguagens:** JavaScript/TypeScript, HTML5, CSS3
- **Frontend:** React, Vite, Vitest, FullCalendar, React Hook Form
- **Backend:** Node.js, Express, Sequelize ORM
- **Banco de dados:** SQLite (desenvolvimento), PostgreSQL (produção)
- **Autenticação:** JWT (JSON Web Tokens)
- **Documentação:** Swagger
- **Ferramentas de desenvolvimento:** Docker, Git, ESLint, Prettier.
 
# Arquitetura da Solução

- **API / Backend:** Node.js com Express, seguindo arquitetura MSC (Model-Service-Controller)
- **Frontend:** Aplicação React com Vite, seguindo a arquitetura de Single Page Application (SPA) 
- **Banco de dados:** SQLite para desenvolvimento e PostgreSQL para produção
- **Autenticação:** JWT para autenticação de usuários
- **Documentação:** API documentada com Swagger


# Como Executar o Projeto  (somente se não tiver no README.md da aplicação)

## 1. Pré-requisitos
- Node.js (versão 20 ou superior)
- npm
- Docker (opcional, para execução em containers)
- Git

## 2. Instalação
```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd PI
# Instalar dependências do backend
cd backend
npm install
# Instalar dependências do frontend
cd ../frontend
npm install
```

## 3. Configuração

Criar arquivo `.env` com as variáveis:

```bash
NODE_ENV=development
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=./data/dev.sqlite
JWT_SECRET=sua_chave_secreta
FRONT_ORIGIN=http://localhost:8080
```

# No Frontend
```bash
VITE_API_URL=http://localhost:3001/api
```

## 4. Executando

```bash
# Iniciar backend
cd backend
npm install
npm run dev

# Em outro terminal, iniciar frontend
cd ../frontend
npm install
npm run dev

# Ou Execeutando com docker
docker-compose up -d
```


# 🧪 Testes

O projeto utiliza Vitest para testes no frontend e Jest para testes no backend.

```bash
# Backend
cd backend
npm test

# Frontend
cd ../frontend
npm test
```

# Deploy / Publicação (se aplicável)

* URL do frontend: https://diario-de-classe-ang-frontend.onrender.com/
* URL da API: https://backend-diario-de-classe-pi.onrender.com/api-docs/

# Licença

Projeto acadêmico sem licença específica.


# Contato do Grupo

- Cauan Ortiz: cauanortiz2019@gmail.com
- Davi Ryan Konuma Lima: davirkl07@gmail.com
- Matheus Henrique Schopp Peixoto: mthenriquepeixoto@gmail.com
