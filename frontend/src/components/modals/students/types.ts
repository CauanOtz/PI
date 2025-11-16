import { BackendAssistido } from "../../../services/students";

// Normalized form data matching backend 3NF structure
export interface ContatoFormData {
  telefone: string;
  nomeContato?: string;
  parentesco?: string;
  observacao?: string;
  ordemPrioridade?: number;
}

export interface EnderecoFormData {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface FiliacaoFormData {
  mae?: string;
  pai?: string;
}

export interface AssistidoFormData {
  nome: string;
  dataNascimento: string;
  sexo: 'Feminino' | 'Masculino';
  cartaoSus?: string;
  rg?: string;
  endereco?: EnderecoFormData;
  numero?: string;
  complemento?: string;
  contatos: ContatoFormData[];
  filiacao?: FiliacaoFormData;
  problemasSaude?: string;
}

export interface CreateAssistidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssistidoFormData) => void;
}

export interface EditAssistidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistido: BackendAssistido | null;
  onSubmit: (data: AssistidoFormData) => void;
}

export interface User {
  id: number | string;
  nome?: string;
  cpf?: string;
  [k: string]: any;
}