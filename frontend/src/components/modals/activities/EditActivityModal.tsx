import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  titulo: z.string().min(3, 'Título muito curto'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  horario: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Horário inválido'),
  descricao: z.string().nullable().optional(),
});

type Form = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  atividade?: Partial<Form> & { id?: number } | null;
  onSubmit: (id: number, data: Form) => Promise<void> | void;
}

export const EditAtividadeModal: React.FC<Props> = ({ isOpen, onClose, atividade, onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<Form>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (isOpen && atividade) {
      reset({
        titulo: atividade.titulo ?? '',
        data: atividade.data ?? '',
        horario: atividade.horario ?? '',
        descricao: atividade.descricao ?? '',
      });
    }
    if (!isOpen) reset();
  }, [isOpen, atividade, reset]);

  const submit = async (data: Form) => {
    if (!atividade?.id) return;
    await onSubmit(atividade.id, data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Editar atividade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 p-2">
          <div>
            <label className="text-sm font-medium">Título</label>
            <Input {...register('titulo')} placeholder="Ex: Matemática Básica" />
            {errors.titulo && <div className="text-xs text-red-600">{errors.titulo.message}</div>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Data</label>
              <Input {...register('data')} type="date" />
              {errors.data && <div className="text-xs text-red-600">{errors.data.message}</div>}
            </div>
            <div>
              <label className="text-sm font-medium">Horário</label>
              <Input {...register('horario')} type="time" />
              {errors.horario && <div className="text-xs text-red-600">{errors.horario.message}</div>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <textarea {...register('descricao')} placeholder="Descrição da atividade" className="w-full rounded-md border border-gray-200 p-2 h-24" />
          </div>

          <DialogFooter>
            <div className="flex items-center justify-end w-full gap-2">
              <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>Salvar</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAtividadeModal;
