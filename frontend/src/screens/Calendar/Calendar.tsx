import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBRLocale from '@fullcalendar/core/locales/pt-br'
import { format } from 'date-fns'
import { SidebarSection } from '../../components/layout/SidebarSection'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal'

interface Task {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  description?: string;
}

export const Calendar = (): JSX.Element => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
  })
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date)
    setNewTask({
      ...newTask,
      start: format(arg.date, "yyyy-MM-dd'T'HH:mm"),
      end: format(arg.date, "yyyy-MM-dd'T'HH:mm"),
    })
    setIsModalOpen(true)
  }

  const handleEventClick = (arg: { event: any }) => {
    const task = tasks.find(t => t.id === arg.event.id)
    if (task) {
      setTaskToDelete(task)
    }
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTask.title.trim()) {
      toast.error('O título da tarefa é obrigatório')
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      start: newTask.start,
      end: newTask.end,
    }

    setTasks([...tasks, task])
    setIsModalOpen(false)
    setNewTask({
      title: '',
      description: '',
      start: '',
      end: '',
    })
    toast.success('Tarefa adicionada com sucesso!')
  }

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setTasks(prev => prev.filter(task => task.id !== taskToDelete.id))
      toast.success('Tarefa removida com sucesso!')
      setTaskToDelete(null)
    }
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full mt-16">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 lg:ml-[283px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Calendário</h1>
              <p className="text-gray-600 mt-1">Gerencie suas tarefas e eventos</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[800px]">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                views={{
                  dayGridMonth: {
                    titleFormat: { year: 'numeric', month: 'long' }
                  },
                  timeGridWeek: {
                    titleFormat: { year: 'numeric', month: 'long', day: '2-digit' }
                  },
                  timeGridDay: {
                    titleFormat: { year: 'numeric', month: 'long', day: '2-digit' }
                  }
                }}
                locale={ptBRLocale}
                events={tasks}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                editable={true}
                selectable={true}
                weekends={true}
                windowResize={function(arg) {
                  if (arg.view.type === 'dayGridMonth' && window.innerWidth < 768) {
                    arg.view.calendar.changeView('timeGridDay');
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95%] max-w-[425px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite uma descrição (opcional)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Início</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={newTask.start}
                  onChange={(e) => setNewTask(prev => ({ ...prev, start: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">Fim</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={newTask.end}
                  onChange={(e) => setNewTask(prev => ({ ...prev, end: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Adicionar Tarefa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {taskToDelete && (
        <DeleteConfirmationModal
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteTask}
          title="Excluir Tarefa"
          description={`Tem certeza que deseja excluir a tarefa "${taskToDelete.title}"?`}
        />
      )}
    </div>
  )
}