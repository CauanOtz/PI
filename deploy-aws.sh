#!/bin/bash

# Script de Deploy AWS - Sistema ANG
# Versão: 1.0.0

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "================================================"
echo "   Sistema ANG - Deploy AWS com Docker"
echo "================================================"
echo -e "${NC}"

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo -e "${YELLOW}Execute: sudo apt install -y docker.io${NC}"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
    echo -e "${YELLOW}Execute: sudo apt install -y docker-compose-plugin${NC}"
    exit 1
fi

# Obter IP público da instância EC2
echo -e "${BLUE}🔍 Obtendo IP público da instância...${NC}"
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "localhost")

if [ "$PUBLIC_IP" = "localhost" ]; then
    echo -e "${YELLOW}⚠️  Não foi possível obter IP público. Usando localhost.${NC}"
else
    echo -e "${GREEN}✅ IP Público: $PUBLIC_IP${NC}"
fi

# Verificar se .env.aws existe
if [ ! -f "backend/.env.aws" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.aws não encontrado. Criando a partir do exemplo...${NC}"
    
    if [ -f "backend/.env.aws.example" ]; then
        cp backend/.env.aws.example backend/.env.aws
        
        # Substituir placeholders com IP público
        if [ "$PUBLIC_IP" != "localhost" ]; then
            sed -i "s|seu-ip-aws|$PUBLIC_IP|g" backend/.env.aws
        fi
        
        echo -e "${GREEN}✅ Arquivo .env.aws criado!${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANTE: Edite backend/.env.aws e altere as senhas!${NC}"
        echo -e "${YELLOW}   - DB_PASSWORD${NC}"
        echo -e "${YELLOW}   - JWT_SECRET${NC}"
        echo -e "${YELLOW}   - SWAGGER_PASS${NC}"
        
        read -p "Pressione ENTER para continuar após editar o arquivo..."
    else
        echo -e "${RED}❌ Arquivo .env.aws.example não encontrado!${NC}"
        exit 1
    fi
fi

# Criar arquivo .env na raiz
echo -e "${BLUE}📝 Criando arquivo .env na raiz...${NC}"
cat > .env << EOF
FRONTEND_URL=http://$PUBLIC_IP:8080
BACKEND_URL=http://$PUBLIC_IP:3001
EOF
echo -e "${GREEN}✅ Arquivo .env criado!${NC}"

# Parar containers existentes
echo -e "${BLUE}🛑 Parando containers existentes...${NC}"
docker compose -f docker-compose.aws.yml down 2>/dev/null || true

# Build das imagens
echo -e "${BLUE}🏗️  Construindo imagens Docker...${NC}"
docker compose -f docker-compose.aws.yml build --no-cache

# Iniciar containers
echo -e "${BLUE}🚀 Iniciando containers...${NC}"
docker compose -f docker-compose.aws.yml up -d

# Aguardar PostgreSQL estar pronto
echo -e "${BLUE}⏳ Aguardando PostgreSQL inicializar...${NC}"
sleep 10

# Verificar status dos containers
echo -e "${BLUE}📊 Status dos containers:${NC}"
docker compose -f docker-compose.aws.yml ps

# Verificar logs do backend
echo -e "${BLUE}📋 Últimas linhas do log do backend:${NC}"
docker compose -f docker-compose.aws.yml logs --tail=20 backend

# Verificar migrações
echo -e "${BLUE}🔄 Verificando migrações do banco...${NC}"
docker exec ang-backend npm run migrate:prod 2>/dev/null || echo -e "${YELLOW}⚠️  Migrações já foram executadas ou houve um erro${NC}"

# Teste de conectividade
echo -e "${BLUE}🧪 Testando conectividade...${NC}"

if curl -s "http://localhost:3001/api/v2/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend está respondendo!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend ainda não está respondendo. Aguarde alguns segundos...${NC}"
fi

# Resumo final
echo -e "${BLUE}"
echo "================================================"
echo "   Deploy Concluído!"
echo "================================================"
echo -e "${NC}"

echo -e "${GREEN}URLs de Acesso:${NC}"
echo -e "  Frontend:  ${BLUE}http://$PUBLIC_IP:8080${NC}"
echo -e "  Backend:   ${BLUE}http://$PUBLIC_IP:3001/api/v2${NC}"
echo -e "  Swagger:   ${BLUE}http://$PUBLIC_IP:3001/api-docs${NC}"
echo ""

echo -e "${YELLOW}Comandos Úteis:${NC}"
echo -e "  Ver logs:            ${BLUE}docker compose -f docker-compose.aws.yml logs -f${NC}"
echo -e "  Parar containers:    ${BLUE}docker compose -f docker-compose.aws.yml down${NC}"
echo -e "  Reiniciar:           ${BLUE}docker compose -f docker-compose.aws.yml restart${NC}"
echo -e "  Status:              ${BLUE}docker compose -f docker-compose.aws.yml ps${NC}"
echo ""

echo -e "${YELLOW}Próximos Passos:${NC}"
echo -e "  1. Criar usuário administrador"
echo -e "  2. Configurar firewall (portas 22, 80, 3001, 8080)"
echo -e "  3. Configurar backup do banco de dados"
echo -e "  4. Configurar HTTPS (opcional)"
echo ""

echo -e "${GREEN}✅ Sistema ANG está pronto para uso!${NC}"
