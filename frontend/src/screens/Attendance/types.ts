export interface Student {
  id: number;
  name: string;
  present: boolean;
  absent: boolean;
  presencaId?: number | null;
  observacao?: string;
}