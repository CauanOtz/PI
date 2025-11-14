/**
 * @openapi
 * components:
 *   schemas:
 *     AssistidoBase:
 *       type: object
 *       required:
 *         - nome
 *         - dataNascimento
 *         - sexo
 *         - contatos
 *       properties:
 *         nome:
 *           type: string
 *           maxLength: 100
 *           minLength: 3
 *           description: Nome completo do assistido
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento (não pode ser futura)
 *         sexo:
 *           type: string
 *           enum: ['Feminino', 'Masculino']
 *           description: Sexo do assistido
 *         cartaoSus:
 *           type: string
 *           maxLength: 20
 *           description: Número do cartão do SUS (opcional)
 *         rg:
 *           type: string
 *           maxLength: 20
 *           description: Número do RG (opcional)
 *         endereco:
 *           type: object
 *           description: Dados do endereço (opcional)
 *           properties:
 *             cep:
 *               type: string
 *               maxLength: 9
 *               description: CEP no formato 12345-678
 *             logradouro:
 *               type: string
 *               maxLength: 255
 *               description: Nome da rua/avenida
 *             bairro:
 *               type: string
 *               maxLength: 100
 *               description: Bairro
 *             cidade:
 *               type: string
 *               maxLength: 100
 *               description: Cidade
 *             estado:
 *               type: string
 *               maxLength: 2
 *               description: UF (sigla do estado)
 *         numero:
 *           type: string
 *           maxLength: 20
 *           description: Número do imóvel (opcional)
 *         complemento:
 *           type: string
 *           maxLength: 100
 *           description: Complemento do endereço (opcional)
 *         contatos:
 *           type: array
 *           minItems: 1
 *           description: Lista de contatos (mínimo 1 obrigatório)
 *           items:
 *             type: object
 *             required:
 *               - telefone
 *             properties:
 *               telefone:
 *                 type: string
 *                 maxLength: 20
 *                 description: Telefone no formato (DD) 99999-9999
 *               nomeContato:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nome do contato
 *               parentesco:
 *                 type: string
 *                 maxLength: 50
 *                 description: Grau de parentesco
 *               ordemPrioridade:
 *                 type: integer
 *                 description: Ordem de prioridade do contato
 *         filiacao:
 *           type: object
 *           description: Dados de filiação (opcional)
 *           properties:
 *             mae:
 *               type: string
 *               maxLength: 100
 *               description: Nome completo da mãe
 *             pai:
 *               type: string
 *               maxLength: 100
 *               description: Nome completo do pai
 *         problemasSaude:
 *           type: string
 *           maxLength: 1000
 *           description: Problemas de saúde, alergias ou condições especiais (opcional)
 *     
 *     NovoAssistido:
 *       allOf:
 *         - $ref: '#/components/schemas/AssistidoBase'
 *         - type: object
 *           example:
 *             nome: "Maria Silva Oliveira"
 *             dataNascimento: "2015-07-22"
 *             sexo: "Feminino"
 *             cartaoSus: "163704163610004"
 *             rg: "12.345.678-9"
 *             endereco:
 *               cep: "01310-100"
 *               logradouro: "Avenida Paulista"
 *               bairro: "Bela Vista"
 *               cidade: "São Paulo"
 *               estado: "SP"
 *             numero: "1578"
 *             complemento: "Apto 501"
 *             contatos:
 *               - telefone: "(11) 98765-4321"
 *                 nomeContato: "Ana Silva"
 *                 parentesco: "Mãe"
 *                 ordemPrioridade: 1
 *             filiacao:
 *               mae: "Ana Silva Santos"
 *               pai: "João Pedro Santos"
 *             problemasSaude: "Alergia a lactose"
 *     
 *     Assistido:
 *       allOf:
 *         - $ref: '#/components/schemas/AssistidoBase'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: ID único do assistido
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Data de criação do registro
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Data da última atualização do registro
 */