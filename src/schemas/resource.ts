import { z } from 'zod'

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const resourceFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  short_description: z.string().max(500).optional(),
  full_description: z.string().max(5000).optional(),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  resource_type: z.string().optional(),
  contributor_id: z.string().min(1, 'Contributor is required'),
  category_id: z.string().min(1, 'Category is required'),
  file_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  external_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_featured: z.boolean(),
  is_public: z.boolean(),
  is_published: z.boolean(),
  tagIds: z.array(z.string()),
})

export type ResourceFormData = z.infer<typeof resourceFormSchema>

export function generateSlug(title: string): string {
  return slugify(title)
}