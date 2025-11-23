# Script de Deploy AWS - Sistema ANG (Windows PowerShell)
# Versão: 1.0.0

Write-Host "`n================================================" -ForegroundColor Blue
Write-Host "   Sistema ANG - Deploy AWS com Docker" -ForegroundColor Blue
Write-Host "================================================`n" -ForegroundColor Blue

# Verificar se Docker está rodando
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker não está rodando ou não está instalado!" -ForegroundColor Red
    Write-Host "Certifique-se de que o Docker Desktop está instalado e em execução." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker está rodando!" -ForegroundColor Green

# Verificar se .env.aws existe
if (-not (Test-Path "backend\.env.aws")) {
    Write-Host "⚠️  Arquivo .env.aws não encontrado." -ForegroundColor Yellow
    
    if (Test-Path "backend\.env.aws.example") {
        Write-Host "📝 Criando .env.aws a partir do exemplo..." -ForegroundColor Blue
        Copy-Item "backend\.env.aws.example" "backend\.env.aws"
        
        Write-Host "✅ Arquivo .env.aws criado!" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANTE: Edite backend\.env.aws e altere as senhas!" -ForegroundColor Yellow
        Write-Host "   - DB_PASSWORD" -ForegroundColor Yellow
        Write-Host "   - JWT_SECRET" -ForegroundColor Yellow
        Write-Host "   - SWAGGER_PASS" -ForegroundColor Yellow
        
        Read-Host "Pressione ENTER para continuar após editar o arquivo"
    } else {
        Write-Host "❌ Arquivo .env.aws.example não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Criar arquivo .env na raiz
Write-Host "📝 Criando arquivo .env na raiz..." -ForegroundColor Blue
@"
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
"@ | Out-File -FilePath ".env" -Encoding utf8
Write-Host "✅ Arquivo .env criado!" -ForegroundColor Green

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Blue
docker compose -f docker-compose.aws.yml down 2>$null

# Build das imagens
Write-Host "🏗️  Construindo imagens Docker..." -ForegroundColor Blue
docker compose -f docker-compose.aws.yml build --no-cache

# Iniciar containers
Write-Host "🚀 Iniciando containers..." -ForegroundColor Blue
docker compose -f docker-compose.aws.yml up -d

# Aguardar PostgreSQL estar pronto
Write-Host "⏳ Aguardando PostgreSQL inicializar..." -ForegroundColor Blue
Start-Sleep -Seconds 10

# Verificar status dos containers
Write-Host "📊 Status dos containers:" -ForegroundColor Blue
docker compose -f docker-compose.aws.yml ps

# Verificar logs do backend
Write-Host "📋 Últimas linhas do log do backend:" -ForegroundColor Blue
docker compose -f docker-compose.aws.yml logs --tail=20 backend

# Verificar migrações
Write-Host "🔄 Executando migrações do banco..." -ForegroundColor Blue
docker exec ang-backend npm run migrate:prod 2>$null

# Teste de conectividade
Write-Host "🧪 Testando conectividade..." -ForegroundColor Blue
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v2/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend está respondendo!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend ainda não está respondendo. Aguarde alguns segundos..." -ForegroundColor Yellow
}

# Resumo final
Write-Host "`n================================================" -ForegroundColor Blue
Write-Host "   Deploy Concluído!" -ForegroundColor Blue
Write-Host "================================================`n" -ForegroundColor Blue

Write-Host "URLs de Acesso:" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:8080" -ForegroundColor Blue
Write-Host "  Backend:   http://localhost:3001/api/v2" -ForegroundColor Blue
Write-Host "  Swagger:   http://localhost:3001/api-docs`n" -ForegroundColor Blue

Write-Host "Comandos Úteis:" -ForegroundColor Yellow
Write-Host "  Ver logs:            docker compose -f docker-compose.aws.yml logs -f" -ForegroundColor Blue
Write-Host "  Parar containers:    docker compose -f docker-compose.aws.yml down" -ForegroundColor Blue
Write-Host "  Reiniciar:           docker compose -f docker-compose.aws.yml restart" -ForegroundColor Blue
Write-Host "  Status:              docker compose -f docker-compose.aws.yml ps`n" -ForegroundColor Blue

Write-Host "Próximos Passos:" -ForegroundColor Yellow
Write-Host "  1. Criar usuário administrador"
Write-Host "  2. Testar a aplicação em http://localhost:8080"
Write-Host "  3. Fazer backup do banco de dados"
Write-Host "  4. Preparar para deploy na AWS EC2`n"

Write-Host "✅ Sistema ANG está pronto para uso!" -ForegroundColor Green
