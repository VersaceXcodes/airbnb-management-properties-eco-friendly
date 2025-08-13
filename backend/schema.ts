import { z } from 'zod';

// User entity schema
export const userSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  created_at: z.coerce.date()
});

// Input schema for creating a user
export const createUserInputSchema = z.object({
  username: z.string().min(1).max(255),
  email: z.string().email().min(1).max(255),
  password_hash: z.string().min(1).max(255),
});

// Input schema for updating a user
export const updateUserInputSchema = z.object({
  id: z.number().int(),
  username: z.string().min(1).max(255).optional(),
  email: z.string().email().min(1).max(255).optional(),
  password_hash: z.string().min(1).max(255).optional(),
});

// Query/schema for searching users
export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['username', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Profile entity schema
export const profileSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date()
});

// Input schema for creating a profile
export const createProfileInputSchema = z.object({
  user_id: z.number().int(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

// Input schema for updating a profile
export const updateProfileInputSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().optional(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

// Query/schema for searching profiles
export const searchProfileInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Post entity schema
export const postSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  title: z.string(),
  content: z.string(),
  image_url: z.string().nullable(),
  created_at: z.coerce.date()
});

// Input schema for creating a post
export const createPostInputSchema = z.object({
  user_id: z.number().int(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  image_url: z.string().nullable().optional(),
});

// Input schema for updating a post
export const updatePostInputSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int().optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  image_url: z.string().nullable().optional(),
});

// Query/schema for searching posts
export const searchPostInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Comment entity schema
export const commentSchema = z.object({
  id: z.number().int(),
  post_id: z.number().int(),
  user_id: z.number().int(),
  comment: z.string(),
  created_at: z.coerce.date()
});

// Input schema for creating a comment
export const createCommentInputSchema = z.object({
  post_id: z.number().int(),
  user_id: z.number().int(),
  comment: z.string().min(1),
});

// Input schema for updating a comment
export const updateCommentInputSchema = z.object({
  id: z.number().int(),
  post_id: z.number().int().optional(),
  user_id: z.number().int().optional(),
  comment: z.string().min(1).optional(),
});

// Query/schema for searching comments
export const searchCommentInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Like entity schema
export const likeSchema = z.object({
  id: z.number().int(),
  post_id: z.number().int(),
  user_id: z.number().int(),
  created_at: z.coerce.date()
});

// Input schema for creating a like
export const createLikeInputSchema = z.object({
  post_id: z.number().int(),
  user_id: z.number().int(),
});

// Note: Likes are typically not updated, so there's no update schema

// Query/schema for searching likes
export const searchLikeInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// inferred types for entities
export type User = z.infer<typeof userSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Post = z.infer<typeof postSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type Like = z.infer<typeof likeSchema>;

// inferred types for input schemas
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

export type CreateProfileInput = z.infer<typeof createProfileInputSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;
export type SearchProfileInput = z.infer<typeof searchProfileInputSchema>;

export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
export type SearchPostInput = z.infer<typeof searchPostInputSchema>;

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
export type SearchCommentInput = z.infer<typeof searchCommentInputSchema>;

export type CreateLikeInput = z.infer<typeof createLikeInputSchema>;
export type SearchLikeInput = z.infer<typeof searchLikeInputSchema>;