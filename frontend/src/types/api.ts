export interface ResponseSuccess<T> {
  sucesso: boolean;
  dados: T;
}

export interface Paginacao {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}