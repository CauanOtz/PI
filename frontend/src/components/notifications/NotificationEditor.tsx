import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { SendIcon, RotateCcwIcon } from 'lucide-react';

export interface NotificationEditorValues {
  titulo: string;
  mensagem: string;
  tipo: string;
  dataExpiracao?: string;
}

interface NotificationEditorProps {
  values: NotificationEditorValues;
  onChange: (patch: Partial<NotificationEditorValues>) => void;
  onSubmit: () => void;
  loading?: boolean;
  tipos: readonly string[];
  onReset: () => void;
}

export function NotificationEditor({ values, onChange, onSubmit, loading, tipos, onReset }: NotificationEditorProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><SendIcon className="w-5 h-5 text-blue-600" /> Nova Notificação</h2>
        <span className="text-xs text-gray-400">Título e mensagem são obrigatórios</span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título *</label>
          <Input value={values.titulo} onChange={e => onChange({ titulo: e.target.value })} placeholder="Ex: Reunião de pais" className="mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mensagem *</label>
          <textarea
            value={values.mensagem}
            onChange={e => onChange({ mensagem: e.target.value })}
            rows={5}
            placeholder="Descreva os detalhes da notificação..."
            className="mt-1 block w-full rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 text-sm resize-y min-h-[140px]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={values.tipo}
              onChange={e => onChange({ tipo: e.target.value })}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Expiração</label>
            <input
              type="datetime-local"
              value={values.dataExpiracao ?? ''}
              onChange={e => onChange({ dataExpiracao: e.target.value || undefined })}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onReset}
              >
                <RotateCcwIcon className="w-4 h-4 mr-1" /> Limpar
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            disabled={loading}
            type="button"
            onClick={onSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Enviando...' : 'Criar e Enviar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
