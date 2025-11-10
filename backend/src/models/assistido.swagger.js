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
 *           type: string
 *           maxLength: 255
 *           description: Logradouro e número (opcional)
 *         bairro:
 *           type: string
 *           maxLength: 100
 *           description: Bairro de residência (opcional)
 *         cep:
 *           type: string
 *           maxLength: 9
 *           pattern: "^\\d{5}-\\d{3}$"
 *           description: CEP no formato 12345-678 (opcional)
 *         cidade:
 *           type: string
 *           maxLength: 100
 *           description: Cidade de residência (opcional)
 *         contato:
 *           type: string
 *           maxLength: 20
 *           pattern: "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$"
 *           description: Telefone no formato (DD) 99999-9999 ou (DD) 9999-9999 (opcional)
 *         problemasSaude:
 *           type: string
 *           maxLength: 1000
 *           description: Problemas de saúde, alergias ou condições especiais (opcional)
 *         pai:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo do pai (opcional)
 *         mae:
 *           type: string
 *           maxLength: 100
 *           description: Nome completo da mãe (opcional)
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
 *             endereco: "Rua das Flores, 123"
 *             bairro: "Centro"
 *             cep: "12345-678"
 *             cidade: "São Paulo"
 *             contato: "(11) 98765-4321"
 *             problemasSaude: "Alergia a amendoim"
 *             pai: "João Oliveira"
 *             mae: "Ana Silva"
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