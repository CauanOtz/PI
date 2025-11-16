import React from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Trash2, Plus } from "lucide-react";
import { ContatoFormData } from "./types";

interface ContatosSectionProps {
  contatos: ContatoFormData[];
  onChange: (contatos: ContatoFormData[]) => void;
}

export const ContatosSection: React.FC<ContatosSectionProps> = ({ contatos, onChange }) => {
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const addContato = () => {
    onChange([
      ...contatos,
      {
        telefone: "",
        nomeContato: "",
        parentesco: "",
        ordemPrioridade: contatos.length + 1,
      },
    ]);
  };

  const removeContato = (index: number) => {
    if (contatos.length > 1) {
      const newContatos = contatos.filter((_, i) => i !== index);
      onChange(newContatos.map((c, i) => ({ ...c, ordemPrioridade: i + 1 })));
    }
  };

  const updateContato = (index: number, field: keyof ContatoFormData, value: any) => {
    const newContatos = [...contatos];
    newContatos[index] = { ...newContatos[index], [field]: value };
    onChange(newContatos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Contatos (obrigatório pelo menos 1)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addContato}
          className="text-blue-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Contato
        </Button>
      </div>

      {contatos.map((contato, index) => (
        <div key={index} className="border p-4 rounded-lg space-y-3 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Contato {index + 1}</span>
            {contatos.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeContato(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`telefone-${index}`}>Telefone *</Label>
              <Input
                id={`telefone-${index}`}
                placeholder="(11) 9xxxx-xxxx"
                value={contato.telefone}
                onChange={(e) =>
                  updateContato(index, "telefone", formatPhone(e.target.value))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`nomeContato-${index}`}>Nome do Contato</Label>
              <Input
                id={`nomeContato-${index}`}
                placeholder="Ex: Maria Silva"
                value={contato.nomeContato || ""}
                onChange={(e) => updateContato(index, "nomeContato", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`parentesco-${index}`}>Parentesco</Label>
              <Input
                id={`parentesco-${index}`}
                placeholder="Ex: Mãe, Pai, Tio"
                value={contato.parentesco || ""}
                onChange={(e) => updateContato(index, "parentesco", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`observacao-${index}`}>Observação</Label>
              <Input
                id={`observacao-${index}`}
                placeholder="Observações opcionais"
                value={contato.observacao || ""}
                onChange={(e) => updateContato(index, "observacao", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
