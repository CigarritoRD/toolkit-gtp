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

export const contributorFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  specialty: z.string().max(100).optional(),
  contact_name: z.string().max(100).optional(),
  contact_role: z.string().max(100).optional(),
  contact_email: z
    .string()
    .email('Invalid email address')
    .max(255)
    .optional()
    .or(z.literal('')),
  contact_phone: z.string().max(50).optional(),
  short_bio: z.string().max(300).optional(),
  full_bio: z.string().max(2000).optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  youtube_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  avatar_url: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type ContributorFormData = z.infer<typeof contributorFormSchema>

export type ContributorFormValues = ContributorFormData

export function generateSlug(name: string): string {
  return slugify(name)
}