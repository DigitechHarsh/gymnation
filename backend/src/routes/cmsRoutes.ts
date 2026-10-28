import { Router } from 'express';
import { getHomeAggregated } from '../controllers/cms/homeController.js';
import {
  getPublicHeroSlides,
  listHeroSlides,
  getHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from '../controllers/cms/heroSlideController.js';
import {
  getPublicMarqueeOffers,
  listMarqueeOffers,
  createMarqueeOffer,
  updateMarqueeOffer,
  deleteMarqueeOffer,
  reorderMarqueeOffers,
} from '../controllers/cms/marqueeController.js';
import {
  getPublicPageSections,
  listAllPageSections,
  createPageSection,
  updatePageSection,
  deletePageSection,
} from '../controllers/cms/pageSectionController.js';
import {
  listWhyUsItems,
  createWhyUsItem,
  updateWhyUsItem,
  deleteWhyUsItem,
  reorderWhyUsItems,
} from '../controllers/cms/whyUsController.js';
import {
  listStats,
  createStat,
  updateStat,
  deleteStat,
  reorderStats,
} from '../controllers/cms/statController.js';
import {
  listGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems,
} from '../controllers/cms/galleryController.js';
import {
  listMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  reorderMembershipPlans,
} from '../controllers/cms/membershipPlanController.js';
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from '../controllers/cms/testimonialController.js';
import {
  listFaqItems,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItems,
} from '../controllers/cms/faqController.js';

import { requireAdminAuth, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import {
  heroSlideSchema,
  marqueeOfferSchema,
  pageSectionSchema,
  whyUsItemSchema,
  statSchema,
  galleryItemSchema,
  membershipPlanSchema,
  testimonialSchema,
  faqItemSchema,
  reorderSchema,
} from '../validators/cms/cmsValidators.js';
import { AdminRole } from '@prisma/client';

const cmsRouter = Router();

// ================= PUBLIC CMS ROUTES =================
cmsRouter.get('/home', getHomeAggregated);
cmsRouter.get('/hero-slides', getPublicHeroSlides);
cmsRouter.get('/marquee', getPublicMarqueeOffers);
cmsRouter.get('/pages/:slug', getPublicPageSections);
cmsRouter.get('/why-us', listWhyUsItems);
cmsRouter.get('/stats', listStats);
cmsRouter.get('/gallery', listGalleryItems);
cmsRouter.get('/membership-plans', listMembershipPlans);
cmsRouter.get('/testimonials', listTestimonials);
cmsRouter.get('/faq', listFaqItems);

// ================= ADMIN CMS ROUTES (SUPER_ADMIN, MANAGER) =================
const adminGuard = [requireAdminAuth, requireRole(AdminRole.SUPER_ADMIN, AdminRole.MANAGER)];

// Hero Slides
cmsRouter.get('/admin/hero-slides', ...adminGuard, listHeroSlides);
cmsRouter.get('/admin/hero-slides/:id', ...adminGuard, getHeroSlideById);
cmsRouter.post('/admin/hero-slides', ...adminGuard, validateBody(heroSlideSchema), createHeroSlide);
cmsRouter.put('/admin/hero-slides/:id', ...adminGuard, validateBody(heroSlideSchema), updateHeroSlide);
cmsRouter.delete('/admin/hero-slides/:id', ...adminGuard, deleteHeroSlide);
cmsRouter.patch('/admin/hero-slides/reorder', ...adminGuard, validateBody(reorderSchema), reorderHeroSlides);

// Marquee
cmsRouter.get('/admin/marquee', ...adminGuard, listMarqueeOffers);
cmsRouter.post('/admin/marquee', ...adminGuard, validateBody(marqueeOfferSchema), createMarqueeOffer);
cmsRouter.put('/admin/marquee/:id', ...adminGuard, validateBody(marqueeOfferSchema), updateMarqueeOffer);
cmsRouter.delete('/admin/marquee/:id', ...adminGuard, deleteMarqueeOffer);
cmsRouter.patch('/admin/marquee/reorder', ...adminGuard, validateBody(reorderSchema), reorderMarqueeOffers);

// Page Sections
cmsRouter.get('/admin/page-sections', ...adminGuard, listAllPageSections);
cmsRouter.post('/admin/page-sections', ...adminGuard, validateBody(pageSectionSchema), createPageSection);
cmsRouter.put('/admin/page-sections/:id', ...adminGuard, validateBody(pageSectionSchema), updatePageSection);
cmsRouter.delete('/admin/page-sections/:id', ...adminGuard, deletePageSection);

// Why Us
cmsRouter.get('/admin/why-us', ...adminGuard, listWhyUsItems);
cmsRouter.post('/admin/why-us', ...adminGuard, validateBody(whyUsItemSchema), createWhyUsItem);
cmsRouter.put('/admin/why-us/:id', ...adminGuard, validateBody(whyUsItemSchema), updateWhyUsItem);
cmsRouter.delete('/admin/why-us/:id', ...adminGuard, deleteWhyUsItem);
cmsRouter.patch('/admin/why-us/reorder', ...adminGuard, validateBody(reorderSchema), reorderWhyUsItems);

// Stats
cmsRouter.get('/admin/stats', ...adminGuard, listStats);
cmsRouter.post('/admin/stats', ...adminGuard, validateBody(statSchema), createStat);
cmsRouter.put('/admin/stats/:id', ...adminGuard, validateBody(statSchema), updateStat);
cmsRouter.delete('/admin/stats/:id', ...adminGuard, deleteStat);
cmsRouter.patch('/admin/stats/reorder', ...adminGuard, validateBody(reorderSchema), reorderStats);

// Gallery
cmsRouter.get('/admin/gallery', ...adminGuard, listGalleryItems);
cmsRouter.post('/admin/gallery', ...adminGuard, validateBody(galleryItemSchema), createGalleryItem);
cmsRouter.put('/admin/gallery/:id', ...adminGuard, validateBody(galleryItemSchema), updateGalleryItem);
cmsRouter.delete('/admin/gallery/:id', ...adminGuard, deleteGalleryItem);
cmsRouter.patch('/admin/gallery/reorder', ...adminGuard, validateBody(reorderSchema), reorderGalleryItems);

// Membership Plans
cmsRouter.get('/admin/membership-plans', ...adminGuard, listMembershipPlans);
cmsRouter.post('/admin/membership-plans', ...adminGuard, validateBody(membershipPlanSchema), createMembershipPlan);
cmsRouter.put('/admin/membership-plans/:id', ...adminGuard, validateBody(membershipPlanSchema), updateMembershipPlan);
cmsRouter.delete('/admin/membership-plans/:id', ...adminGuard, deleteMembershipPlan);
cmsRouter.patch('/admin/membership-plans/reorder', ...adminGuard, validateBody(reorderSchema), reorderMembershipPlans);

// Testimonials
cmsRouter.get('/admin/testimonials', ...adminGuard, listTestimonials);
cmsRouter.post('/admin/testimonials', ...adminGuard, validateBody(testimonialSchema), createTestimonial);
cmsRouter.put('/admin/testimonials/:id', ...adminGuard, validateBody(testimonialSchema), updateTestimonial);
cmsRouter.delete('/admin/testimonials/:id', ...adminGuard, deleteTestimonial);
cmsRouter.patch('/admin/testimonials/reorder', ...adminGuard, validateBody(reorderSchema), reorderTestimonials);

// FAQs
cmsRouter.get('/admin/faq', ...adminGuard, listFaqItems);
cmsRouter.post('/admin/faq', ...adminGuard, validateBody(faqItemSchema), createFaqItem);
cmsRouter.put('/admin/faq/:id', ...adminGuard, validateBody(faqItemSchema), updateFaqItem);
cmsRouter.delete('/admin/faq/:id', ...adminGuard, deleteFaqItem);
cmsRouter.patch('/admin/faq/reorder', ...adminGuard, validateBody(reorderSchema), reorderFaqItems);

export default cmsRouter;
