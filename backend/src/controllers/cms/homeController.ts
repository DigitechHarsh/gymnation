import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { sendSuccess } from '../../utils/response.js';

export const getHomeAggregated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      heroSlides,
      marqueeOffers,
      stats,
      featuredProducts,
      plans,
      testimonials,
      faqItems,
      galleryItems,
      pageSections,
    ] = await Promise.all([
      // 1. Hero slides
      prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      // 2. Marquee offers
      prisma.marqueeOffer.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      // 3. Stats
      prisma.stat.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      // 4. Featured products
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true, deletedAt: null },
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
          },
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
      // 5. Membership plans
      prisma.membershipPlan.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      // 6. Testimonials
      prisma.testimonial.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }),
      // 7. FAQs
      prisma.faqItem.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 8,
      }),
      // 8. Gallery preview
      prisma.galleryItem.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }),
      // 9. Home page sections
      prisma.pageSection.findMany({
        where: { pageSlug: 'home', isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    // Cache-Control headers for high-performance home landing
    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');

    return sendSuccess(res, {
      heroSlides,
      marqueeOffers,
      stats,
      featuredProducts,
      plans,
      testimonials,
      faqItems,
      galleryItems,
      pageSections,
    }, 'Home aggregated data retrieved');
  } catch (error) {
    next(error);
  }
};
