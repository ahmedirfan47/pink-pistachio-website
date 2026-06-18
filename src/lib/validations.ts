import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Enter a valid email'),
  customerPhone: z.string().min(10, 'Enter a valid phone number'),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z.string().optional(),
  area: z.string().optional(),
  city: z.string().optional(),
  branch: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'CARD']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.deliveryType === 'pickup' || (!!data.address && !!data.area),
  { message: 'Address and area are required for delivery', path: ['address'] }
);

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  compareAtPrice: z.coerce.number().nonnegative().optional().nullable(),
  categoryId: z.string().min(1),
  images: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  stock: z.coerce.number().int().nonnegative().default(50),
  sku: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().nonnegative().default(0),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional().nullable(),
});

export const bannerSchema = z.object({
  type: z.enum(['HERO', 'PROMO', 'GALLERY']),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  image: z.string().min(1),
  link: z.string().optional().nullable(),
  position: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  siteName: z.string().min(1),
  tagline: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  primaryPhone: z.string().optional().nullable(),
  primaryEmail: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  deliveryFee: z.coerce.number().int().nonnegative(),
  freeDeliveryMin: z.coerce.number().int().nonnegative(),
  aboutText: z.string().optional().nullable(),
});
