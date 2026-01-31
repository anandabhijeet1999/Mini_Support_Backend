import { TicketPriority, TicketStatus } from '../types/ticket';
import {
  listTickets as listTicketsRepo,
  createTicket as createTicketRepo,
  getTicketById,
  updateTicket as updateTicketRepo,
  deleteTicket as deleteTicketRepo,
} from '../repositories/ticketRepository';

export async function listTickets(params: {
  q?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  sort?: 'createdAt_asc' | 'createdAt_desc';
  page: number;
  limit: number;
}) {
  return listTicketsRepo(params);
}

export async function createTicket(data: {
  title: string;
  description: string;
  status?: TicketStatus;
  priority: TicketPriority;
}) {
  const status: TicketStatus = data.status ?? 'OPEN';
  return createTicketRepo({
    title: data.title,
    description: data.description,
    status,
    priority: data.priority,
  });
}

export async function getTicketOrThrow(id: string) {
  const ticket = await getTicketById(id);
  if (!ticket) {
    const error: any = new Error('Ticket not found');
    error.status = 404;
    throw error;
  }
  return ticket;
}

export async function updateTicket(id: string, data: Partial<{
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}>) {
  await getTicketOrThrow(id);
  return updateTicketRepo(id, data);
}

export async function deleteTicket(id: string) {
  await getTicketOrThrow(id);
  await deleteTicketRepo(id);
}

