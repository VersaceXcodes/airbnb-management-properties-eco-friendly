import { z } from 'zod';

// Property entity schema
export const propertySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.string(),
  amenities: z.array(z.string()),
  eco_rating: z.number().min(0).max(5),
  host_id: z.string(),
  created_at: z.string(),
});

// Input schema for creating a property
export const createPropertyInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  location: z.string().min(1).max(255),
  amenities: z.array(z.string()),
  eco_rating: z.number().min(0).max(5),
});

// Input schema for updating a property
export const updatePropertyInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).max(255).optional(),
  amenities: z.array(z.string()).optional(),
  eco_rating: z.number().min(0).max(5).optional(),
});

// Feedback schema
export const feedbackSchema = z.object({
  id: z.string(),
  property_id: z.string(),
  guest_id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  created_at: z.string(),
});

// Input schema for creating feedback
export const createFeedbackInputSchema = z.object({
  property_id: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

// Eco tip schema (for compatibility with existing UI)
export const ecoTipSchema = z.object({
  category: z.string(),
  tips: z.array(z.string()),
});

// User type (for compatibility with existing code)
export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

// Additional interfaces for dashboard and other features
export interface EcoMetrics {
  carbon_footprint: number;
  water_savings: number;
  energy_efficiency: number;
  waste_reduction: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
}

// Inferred types
export type Property = z.infer<typeof propertySchema>;
export type CreatePropertyInput = z.infer<typeof createPropertyInputSchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertyInputSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;
export type CreateFeedbackInput = z.infer<typeof createFeedbackInputSchema>;
export type EcoTip = z.infer<typeof ecoTipSchema>;