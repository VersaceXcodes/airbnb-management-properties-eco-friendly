import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const zodValidator = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
