import { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url + '/',        changeFrequency: 'daily',   priority: 1 },
    { url: SITE.url + '/menu',    changeFrequency: 'daily',   priority: 0.9 },
    { url: SITE.url + '/about',   changeFrequency: 'monthly', priority: 0.5 },
    { url: SITE.url + '/contact', changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Safely query DB — returns empty arrays if DATABASE_URL is missing at build time
  let productRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const { db } = await import('@/lib/db');

    const [products, categories] = await Promise.all([
      db.product.findMany({
        select: { slug: true, updatedAt: true },
        where: { isAvailable: true },
      }),
      db.category.findMany({
        select: { slug: true, updatedAt: true },
        where: { isActive: true },
      }),
    ]);

    productRoutes = products.map((p) => ({
      url: SITE.url + '/product/' + p.slug,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    categoryRoutes = categories.map((c) => ({
      url: SITE.url + '/menu?category=' + c.slug,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    // DATABASE_URL not available at build time — sitemap will only include static routes
    // Dynamic routes are added automatically when the site is live
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}