/**
 * Valida um número de cartão do SUS
 * @param {string} numeroCartao - Número do cartão SUS a ser validado
 * @returns {boolean} - true se o cartão for válido, false caso contrário
 */
export function validarCartaoSUS(numeroCartao) {
    if (!numeroCartao) return false;

    // Remove qualquer caractere não numérico
    numeroCartao = String(numeroCartao).replace(/\D/g, '');

    // Verifica se tem 15 dígitos
    if (numeroCartao.length !== 15) {
        return false;
    }

    // Verifica se começa com um dígito válido
    const primeiroDigito = parseInt(numeroCartao.charAt(0));
    if (![1, 2, 7, 8, 9].includes(primeiroDigito)) {
        return false;
    }

    // Soma ponderada dos 14 primeiros dígitos
    let soma = 0;
    for (let i = 0; i < 14; i++) {
        const digito = parseInt(numeroCartao.charAt(i));
        const peso = 15 - i;
        soma += digito * peso;
    }
    
    // O algoritmo é igual para todos os tipos de cartão:
    // 1. Multiplicar a soma por 10
    // 2. Obter o resto da divisão por 11
    // 3. Se o resto é 10, usar 0
    const mult = soma * 10;
    const resto = mult % 11;
    const dv = resto === 10 ? 0 : resto;
    const dvInformado = parseInt(numeroCartao.charAt(14));    return dv === dvInformado;
}

/**
 * Formata um número de cartão do SUS adicionando pontos
 * @param {string} numeroCartao - Número do cartão SUS a ser formatado
 * @returns {string} - Cartão SUS formatado ou string vazia se inválido
 */
export function formatarCartaoSUS(numeroCartao) {
    // Se o cartão não for válido, retorna string vazia
    if (!validarCartaoSUS(numeroCartao)) return '';
    
    // Remove caracteres não numéricos
    const numero = String(numeroCartao).replace(/\D/g, '');
    
    // Formata o número (exemplo: 123.4567.8901.2345)
    return numero.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1.$2.$3.$4');
}