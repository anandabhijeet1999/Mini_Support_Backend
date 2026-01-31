import {
  createComment as createCommentRepo,
  listCommentsByTicketId,
} from '../repositories/commentRepository';
import { getTicketOrThrow } from './ticketService';

export async function listComments(params: { ticketId: string; page: number; limit: number }) {
  await getTicketOrThrow(params.ticketId);
  return listCommentsByTicketId(params);
}

export async function createComment(data: {
  ticketId: string;
  authorName: string;
  message: string;
}) {
  await getTicketOrThrow(data.ticketId);
  return createCommentRepo(data);
}

