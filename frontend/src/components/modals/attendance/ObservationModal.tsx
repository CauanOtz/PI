import { useState, useEffect } from "react";
import { Button } from "../../ui/button";

interface Props {
  isOpen: boolean;
  initial?: string;
  onClose: () => void;
  onConfirm: (observacao: string) => void;
  title?: string;
}

export const ObservationModal = ({ isOpen, initial = "", onClose, onConfirm, title = "Observação" }: Props) => {
  const [text, setText] = useState<string>(initial);

  useEffect(() => {
    if (isOpen) setText(initial);
  }, [isOpen, initial]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Adicione uma observação (opcional)..."
          className="w-full border rounded p-2 min-h-[120px] resize-y"
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm(text)}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
};