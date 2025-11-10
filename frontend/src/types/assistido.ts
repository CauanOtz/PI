export interface Assistido {
  id: number;
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string;
  rg?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  contato?: string;
  problemasSaude?: string;
  pai?: string;
  mae?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssistidoCreate {
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string;
  rg?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  cidade?: string;
  contato?: string;
  problemasSaude?: string;
  pai?: string;
  mae?: string;
}

export interface AssistidoUpdate extends Partial<AssistidoCreate> {
  id: number;
}

export interface AssistidoWithResponsaveis extends Assistido {
  responsaveis: {
    id: number;
    nome: string;
    email: string;
  }[];
}

export interface AssistidosResponse {
  assistidos: AssistidoWithResponsaveis[];
  paginacao: {
    total: number;
    paginaAtual: number;
    totalPaginas: number;
    itensPorPagina: number;
    temProximaPagina: boolean;
    temPaginaAnterior: boolean;
  };
}

export interface AssistidoPresenca {
  idAssistido: number | string;
  idAtividade: number | string;
  idAula?: number | string; // Deprecated, use idAtividade
  status: 'presente' | 'falta' | 'atraso' | 'falta_justificada';
  data_registro?: string;
  observacao?: string;
}