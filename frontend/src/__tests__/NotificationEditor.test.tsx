import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationEditor, NotificationEditorValues } from '../components/notifications/NotificationEditor';

const base: NotificationEditorValues = { titulo: '', mensagem: '', tipo: 'info', dataExpiracao: undefined };

describe('NotificationEditor', () => {
  it('calls onChange for titulo and mensagem', () => {
    const handleChange = vi.fn();
    render(<NotificationEditor values={base} onChange={handleChange} onSubmit={() => {}} tipos={['info']} onReset={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Ex: Reunião de pais'), { target: { value: 'Reunião' } });
    fireEvent.change(screen.getByPlaceholderText('Descreva os detalhes da notificação...'), { target: { value: 'Detalhes' } });
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('calls onSubmit when button clicked', () => {
    const handleSubmit = vi.fn();
    render(<NotificationEditor values={base} onChange={() => {}} onSubmit={handleSubmit} tipos={['info']} onReset={() => {}} />);
    fireEvent.click(screen.getByText('Criar e Enviar'));
    expect(handleSubmit).toHaveBeenCalled();
  });
});
