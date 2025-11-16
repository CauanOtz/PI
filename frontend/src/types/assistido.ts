// Normalized structure (3NF)
export interface Endereco {
  cep: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Contato {
  telefone: string;
  nomeContato?: string;
  parentesco?: string;
  observacao?: string;
  ordemPrioridade?: number;
}

export interface Filiacao {
  mae?: string;
  pai?: string;
}

export interface Assistido {
  id: number;
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string;
  rg?: string;
  endereco?: Endereco;
  numero?: string;
  complemento?: string;
  contatos: Contato[];
  filiacao?: Filiacao;
  problemasSaude?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssistidoCreate {
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string;
  rg?: string;
  endereco?: Endereco;
  numero?: string;
  complemento?: string;
  contatos: Contato[];
  filiacao?: Filiacao;
  problemasSaude?: string;
}

export interface AssistidoUpdate extends Partial<AssistidoCreate> {
  id: number;
}

export interface AssistidosResponse {
  assistidos: Assistido[];
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
  status: 'presente' | 'falta' | 'atraso' | 'falta_justificada';
  data_registro?: string;
  observacao?: string;
}