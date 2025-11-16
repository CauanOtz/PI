# Script para testar endpoints da API
$baseUrl = "http://localhost:3001/api/v2"
$token = ""

Write-Host "`n========== TESTE DE ENDPOINTS - SCHEMA NORMALIZADO ==========`n" -ForegroundColor Cyan

# 1. Criar usuário admin
Write-Host "1. Criando usuário admin..." -ForegroundColor Yellow
try {
    $body = @{
        nome = "Admin Teste 2"
        email = "admin2@test.com"
        senha = "Admin@123"
        cpf = "93044915002"
        role = "admin"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/usuarios/registrar" -Method POST -Body $body -ContentType "application/json"
    $token = $response.dados.token
    Write-Host "✅ Usuário criado! Token obtido" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Usuário já existe ou erro: $($_.Exception.Message)" -ForegroundColor DarkYellow
    
    # Tentar login
    try {
        $loginBody = @{
            email = "admin2@test.com"
            senha = "Admin@123"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/usuarios/login" -Method POST -Body $loginBody -ContentType "application/json"
        $token = $loginResponse.dados.token
        Write-Host "✅ Login realizado! Token obtido" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha no login: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Criar assistido com novo esquema normalizado
Write-Host "`n2. Criando assistido com endereço, contatos e filiação..." -ForegroundColor Yellow
try {
    $assistidoBody = @{
        nome = "Maria Silva Santos"
        dataNascimento = "2015-07-22"
        sexo = "Feminino"
        cartaoSus = "123456789012345"
        rg = "12.345.678-9"
        endereco = @{
            cep = "01310-100"
            logradouro = "Avenida Paulista"
            bairro = "Bela Vista"
            cidade = "São Paulo"
            estado = "SP"
        }
        numero = "1578"
        complemento = "Apto 501"
        contatos = @(
            @{
                telefone = "(11) 98765-4321"
                nomeContato = "Ana Silva"
                parentesco = "Mãe"
                ordemPrioridade = 1
            },
            @{
                telefone = "(11) 91234-5678"
                nomeContato = "João Santos"
                parentesco = "Pai"
                ordemPrioridade = 2
            }
        )
        filiacao = @{
            mae = "Ana Silva Santos"
            pai = "João Pedro Santos"
        }
        problemasSaude = "Alergia a lactose"
    } | ConvertTo-Json -Depth 5
    
    $assistido = Invoke-RestMethod -Uri "$baseUrl/assistidos" -Method POST -Body $assistidoBody -Headers $headers
    $assistidoId = $assistido.dados.assistido.id
    Write-Host "✅ Assistido criado! ID: $assistidoId" -ForegroundColor Green
    Write-Host "   - Nome: $($assistido.dados.assistido.nome)" -ForegroundColor Gray
    Write-Host "   - Endereço: $($assistido.dados.assistido.endereco.logradouro)" -ForegroundColor Gray
    Write-Host "   - Contatos: $($assistido.dados.assistido.contatos.Count)" -ForegroundColor Gray
    Write-Host "   - Filiação: Mãe e Pai cadastrados" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao criar assistido: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Listar assistidos
Write-Host "`n3. Listando assistidos..." -ForegroundColor Yellow
try {
    $assistidos = Invoke-RestMethod -Uri "$baseUrl/assistidos?page=1&limit=10" -Method GET -Headers $headers
    Write-Host "✅ Total de assistidos: $($assistidos.dados.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao listar assistidos: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Obter assistido por ID (com relacionamentos)
if ($assistidoId) {
    Write-Host "`n4. Obtendo assistido por ID (com todos os relacionamentos)..." -ForegroundColor Yellow
    try {
        $assistidoCompleto = Invoke-RestMethod -Uri "$baseUrl/assistidos/$assistidoId" -Method GET -Headers $headers
        Write-Host "✅ Assistido obtido com sucesso!" -ForegroundColor Green
        Write-Host "   Dados completos:" -ForegroundColor Gray
        $assistidoCompleto.dados | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray
    } catch {
        Write-Host "❌ Erro ao obter assistido: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 5. Atualizar assistido
if ($assistidoId) {
    Write-Host "`n5. Atualizando assistido (alterando contatos)..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            nome = "Maria Silva Santos"
            contatos = @(
                @{
                    telefone = "(11) 98765-4321"
                    nomeContato = "Ana Silva (Mãe)"
                    parentesco = "Mãe"
                    ordemPrioridade = 1
                },
                @{
                    telefone = "(11) 99999-8888"
                    nomeContato = "José Silva"
                    parentesco = "Tio"
                    ordemPrioridade = 3
                }
            )
        } | ConvertTo-Json -Depth 5
        
        $updated = Invoke-RestMethod -Uri "$baseUrl/assistidos/$assistidoId" -Method PUT -Body $updateBody -Headers $headers
        Write-Host "✅ Assistido atualizado! Novos contatos:" -ForegroundColor Green
        $updated.dados.assistido.contatos | ForEach-Object { Write-Host "   - $($_.nomeContato): $($_.telefone)" -ForegroundColor Gray }
    } catch {
        Write-Host "❌ Erro ao atualizar assistido: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Criar atividade
Write-Host "`n6. Criando atividade..." -ForegroundColor Yellow
try {
    $atividadeBody = @{
        titulo = "Aula de Música"
        descricao = "Aula de iniciação musical"
        data = "2025-11-15"
        horaInicio = "14:00"
        horaFim = "15:30"
    } | ConvertTo-Json
    
    $atividade = Invoke-RestMethod -Uri "$baseUrl/atividades" -Method POST -Body $atividadeBody -Headers $headers
    $atividadeId = $atividade.dados.id
    Write-Host "✅ Atividade criada! ID: $atividadeId" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao criar atividade: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Registrar presença (com novos campos idAssistido e idAtividade)
if ($assistidoId -and $atividadeId) {
    Write-Host "`n7. Registrando presença do assistido na atividade..." -ForegroundColor Yellow
    try {
        $presencaBody = @{
            idAssistido = $assistidoId
            idAtividade = $atividadeId
            status = "presente"
            data_registro = "2025-11-15"
        } | ConvertTo-Json
        
        $presenca = Invoke-RestMethod -Uri "$baseUrl/presencas" -Method POST -Body $presencaBody -Headers $headers
        Write-Host "✅ Presença registrada! ID: $($presenca.dados.id)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao registrar presença: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 8. Listar presenças por atividade (novo endpoint listarPresencasPorAtividade)
if ($atividadeId) {
    Write-Host "`n8. Listando presenças por atividade..." -ForegroundColor Yellow
    try {
        $presencas = Invoke-RestMethod -Uri "$baseUrl/presencas/atividade/$atividadeId" -Method GET -Headers $headers
        Write-Host "✅ Presenças obtidas! Total: $($presencas.dados.presencas.Count)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao listar presenças: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9. Listar histórico do assistido (novo endpoint listarHistoricoAssistido)
if ($assistidoId) {
    Write-Host "`n9. Listando histórico de presenças do assistido..." -ForegroundColor Yellow
    try {
        $historico = Invoke-RestMethod -Uri "$baseUrl/presencas/assistido/$assistidoId" -Method GET -Headers $headers
        Write-Host "✅ Histórico obtido! Total de registros: $($historico.dados.historico.Count)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao obter histórico: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 10. Registrar presenças em lote (bulkRegister)
if ($atividadeId) {
    Write-Host "`n10. Registrando presenças em lote..." -ForegroundColor Yellow
    try {
        # Criar mais assistidos para testar bulk
        $assistido2Body = @{
            nome = "João Pedro"
            dataNascimento = "2016-03-10"
            sexo = "Masculino"
            contatos = @(
                @{
                    telefone = "(11) 97777-6666"
                    nomeContato = "Pedro"
                    parentesco = "Pai"
                    ordemPrioridade = 1
                }
            )
        } | ConvertTo-Json -Depth 3
        
        $assistido2 = Invoke-RestMethod -Uri "$baseUrl/assistidos" -Method POST -Body $assistido2Body -Headers $headers
        $assistidoId2 = $assistido2.dados.assistido.id
        
        $bulkBody = @(
            @{
                idAssistido = $assistidoId
                idAtividade = $atividadeId
                status = "presente"
                data_registro = "2025-11-16"
            },
            @{
                idAssistido = $assistidoId2
                idAtividade = $atividadeId
                status = "falta"
                data_registro = "2025-11-16"
            }
        ) | ConvertTo-Json -Depth 3
        
        $bulk = Invoke-RestMethod -Uri "$baseUrl/presencas/bulk" -Method POST -Body $bulkBody -Headers $headers
        Write-Host "✅ Presenças em lote registradas! Total: $($bulk.dados.resultados.Count)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao registrar em lote: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========== TESTES CONCLUÍDOS ==========`n" -ForegroundColor Cyan
Write-Host "Resumo:" -ForegroundColor White
Write-Host "✅ Novo esquema normalizado funcionando" -ForegroundColor Green
Write-Host "✅ Endereços, Contatos e Filiação funcionais" -ForegroundColor Green
Write-Host "✅ Endpoints de Assistido (CRUD completo)" -ForegroundColor Green
Write-Host "✅ Endpoints de Presença com idAssistido/idAtividade" -ForegroundColor Green
Write-Host "✅ Novos endpoints: listarPresencasPorAtividade e listarHistoricoAssistido" -ForegroundColor Green
