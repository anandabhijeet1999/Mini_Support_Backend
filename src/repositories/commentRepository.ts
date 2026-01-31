import prisma from '../prismaClient';

export async function listCommentsByTicketId(params: {
  ticketId: string;
  page: number;
  limit: number;
}) {
  const { ticketId, page, limit } = params;

  const where = { ticketId };

  const [items, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function createComment(data: {
  ticketId: string;
  authorName: string;
  message: string;
}) {
  return prisma.comment.create({ data });
}

