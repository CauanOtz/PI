    import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { FileTextIcon, DownloadIcon } from 'lucide-react';

interface Report {
  id: string | number;
  name: string;
  type?: string;
  date?: string;
  size?: string;
  category?: string;
  descricao?: string;
}

interface ViewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
  onDownload?: (report: Report) => Promise<void> | void;
}

export const ViewReportModal: React.FC<ViewReportModalProps> = ({ isOpen, onClose, report, onDownload }) => {
  if (!report) return null;

  const handleDownload = async () => {
    if (!onDownload) return;
    try {
      await onDownload(report);
      onClose();
    } catch (err) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileTextIcon className="w-5 h-5 text-blue-600" />
            Informações do Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <div className="text-sm text-gray-500">Nome</div>
            <div className="font-medium text-gray-800 break-words">{report.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <div className="text-xs text-gray-500">Categoria</div>
              <div className="font-medium text-gray-800">{report.category ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Tipo</div>
              <div className="font-medium text-gray-800">{report.type ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Tamanho</div>
              <div className="font-medium text-gray-800">{report.size ?? '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Data</div>
              <div className="font-medium text-gray-800">{report.date ? new Date(report.date).toLocaleString() : '-'}</div>
            </div>
          </div>

          {report.descricao && (
            <div>
              <div className="text-xs text-gray-500">Descrição</div>
              <div className="font-medium text-gray-800">{report.descricao}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
          <Button type="button" onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Baixar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReportModal;
