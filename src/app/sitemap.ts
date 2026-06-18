import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ select: { slug: true, updatedAt: true } });
  const categories = await db.category.findMany({ select: { slug: true, updatedAt: true } });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/menu`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/contact`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE.url}/menu?category=${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}