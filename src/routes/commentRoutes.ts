import express from 'express';
import { createComment, listComments } from '../services/commentService';
import { createCommentSchema, paginateQuerySchema } from '../validation/ticketSchemas';

const router = express.Router();

router.get('/:id/comments', async (req, res, next) => {
  try {
    const { page, limit } = paginateQuerySchema.parse(req.query);
    const result = await listComments({
      ticketId: req.params.id,
      page,
      limit,
    });
    res.json(result);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

router.post('/:id/comments', async (req, res, next) => {
  try {
    const parsed = createCommentSchema.parse(req.body);
    const comment = await createComment({
      ticketId: req.params.id,
      authorName: parsed.authorName,
      message: parsed.message,
    });
    res.status(201).json(comment);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

export default router;

