import { BackendAssistido } from "../../../services/students";

export interface AssistidoFormData {
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
  contatoEmergencia?: string;
  problemasSaude?: string;
  observacoes?: string;
  pai?: string;
  mae?: string;
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