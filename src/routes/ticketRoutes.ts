import express from 'express';
import { TicketPriority, TicketStatus } from '../types/ticket';
import {
  createTicket,
  deleteTicket,
  getTicketOrThrow,
  listTickets,
  updateTicket,
} from '../services/ticketService';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  updateTicketSchema,
} from '../validation/ticketSchemas';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const parsed = listTicketsQuerySchema.parse(req.query);
    const result = await listTickets({
      q: parsed.q,
      status: parsed.status as TicketStatus | undefined,
      priority: parsed.priority as TicketPriority | undefined,
      sort: parsed.sort,
      page: parsed.page,
      limit: parsed.limit,
    });
    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = createTicketSchema.parse(req.body);
    const ticket = await createTicket({
      title: parsed.title,
      description: parsed.description,
      priority: parsed.priority as TicketPriority,
      status: parsed.status as TicketStatus | undefined,
    });
    res.status(201).json(ticket);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const ticket = await getTicketOrThrow(req.params.id);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = updateTicketSchema.parse(req.body);
    const ticket = await updateTicket(req.params.id, parsed);
    res.json(ticket);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteTicket(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

