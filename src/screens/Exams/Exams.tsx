import React, { useState } from "react";
import { SidebarSection } from "../../components/layout/SidebarSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, Search, PencilIcon, Trash2Icon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "../../components/modals/DeleteConfirmationModal";

interface Exam {
  id: string;
  title: string;
  subject: string;
  class: string;
  date: string;
  maxScore: number;
  weight: number;
}

export const Exams = (): JSX.Element => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class: "",
    date: "",
    maxScore: 10,
    weight: 1,
  });
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExam) {
      setExams(prev => prev.map(exam => 
        exam.id === editingExam.id 
          ? { ...formData, id: editingExam.id }
          : exam
      ));
      toast.success("Avaliação atualizada com sucesso!");
    } else {
      const newExam: Exam = {
        ...formData,
        id: Date.now().toString(),
      };
      setExams(prev => [...prev, newExam]);
      toast.success("Avaliação criada com sucesso!");
    }

    setIsModalOpen(false);
    setEditingExam(null);
    setFormData({
      title: "",
      subject: "",
      class: "",
      date: "",
      maxScore: 10,
      weight: 1,
    });
  };

  const handleDelete = (exam: Exam) => {
    setExamToDelete(exam);
  };

  const handleConfirmDelete = () => {
    if (examToDelete) {
      setExams(prev => prev.filter(e => e.id !== examToDelete.id));
      toast.success("Avaliação excluída com sucesso!");
      setExamToDelete(null);
    }
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Avaliações</h1>
              <p className="text-gray-600 mt-1">Gerencie as avaliações dos alunos</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar avaliações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Título</th>
                    <th className="text-left p-4 hidden sm:table-cell">Disciplina</th>
                    <th className="text-left p-4 hidden md:table-cell">Turma</th>
                    <th className="text-left p-4 hidden sm:table-cell">Data</th>
                    <th className="text-center p-4 hidden lg:table-cell">Nota Máxima</th>
                    <th className="text-center p-4 hidden lg:table-cell">Peso</th>
                    <th className="text-right p-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="border-b last:border-0">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{exam.title}</div>
                          <div className="text-sm text-gray-500 sm:hidden">{exam.subject}</div>
                          <div className="text-sm text-gray-500 md:hidden">{exam.class}</div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {new Date(exam.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 lg:hidden">
                            Nota: {exam.maxScore} | Peso: {exam.weight}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">{exam.subject}</td>
                      <td className="p-4 hidden md:table-cell">{exam.class}</td>
                      <td className="p-4 hidden sm:table-cell">
                        {new Date(exam.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center hidden lg:table-cell">{exam.maxScore}</td>
                      <td className="p-4 text-center hidden lg:table-cell">{exam.weight}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingExam(exam);
                              setFormData(exam);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exam)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredExams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhuma avaliação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] max-w-[425px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {editingExam ? 'Editar Avaliação' : 'Nova Avaliação'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Prova 1 - Matemática"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Disciplina</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ex: Matemática"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Turma</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                placeholder="Ex: 9º Ano A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxScore">Nota Máxima</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.maxScore}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsModalOpen(false);
                setEditingExam(null);
                setFormData({
                  title: "",
                  subject: "",
                  class: "",
                  date: "",
                  maxScore: 10,
                  weight: 1,
                });
              }}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingExam ? 'Salvar Alterações' : 'Criar Avaliação'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remover Avaliação"
        description={`Tem certeza que deseja remover a avaliação "${examToDelete?.title}"? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};