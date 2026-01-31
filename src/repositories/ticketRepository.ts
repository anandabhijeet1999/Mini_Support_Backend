import prisma from '../prismaClient';
import { TicketStatus, TicketPriority } from '../types/ticket';

interface ListTicketsParams {
  q?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  sort?: 'createdAt_asc' | 'createdAt_desc';
  page: number;
  limit: number;
}

export async function listTickets(params: ListTicketsParams) {
  const { q, status, priority, sort, page, limit } = params;

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  const orderBy =
    sort === 'createdAt_asc'
      ? { createdAt: 'asc' as const }
      : { createdAt: 'desc' as const };

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createTicket(data: {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}) {
  return prisma.ticket.create({ data });
}

export async function getTicketById(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
  });
}

export async function updateTicket(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
  }>
) {
  return prisma.ticket.update({
    where: { id },
    data,
  });
}

export async function deleteTicket(id: string) {
  return prisma.ticket.delete({
    where: { id },
  });
}

