import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const getCloudinarySignature = (folder = 'gymnation') => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
};

export const checkMediaUsage = async (publicId: string, url: string) => {
  const usages: Array<{ entity: string; id: string; name: string }> = [];

  // 1. Hero slides
  const slides = await prisma.heroSlide.findMany();
  for (const s of slides) {
    const raw = JSON.stringify(s);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'HERO_SLIDE', id: s.id, name: `${s.heading} ${s.cursiveWord}` });
    }
  }

  // 2. Products
  const products = await prisma.product.findMany();
  for (const p of products) {
    const raw = JSON.stringify(p.images);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'PRODUCT', id: p.id, name: p.name });
    }
  }

  // 3. Categories
  const categories = await prisma.category.findMany();
  for (const c of categories) {
    const raw = JSON.stringify(c.image);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'CATEGORY', id: c.id, name: c.name });
    }
  }

  // 4. Gallery
  const gallery = await prisma.galleryItem.findMany();
  for (const g of gallery) {
    const raw = JSON.stringify(g.media);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'GALLERY_ITEM', id: g.id, name: g.caption });
    }
  }

  // 5. Why Us
  const whyUs = await prisma.whyUsItem.findMany();
  for (const w of whyUs) {
    const raw = JSON.stringify(w.media);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'WHY_US', id: w.id, name: `${w.number} ${w.title}` });
    }
  }

  // 6. Testimonials
  const testimonials = await prisma.testimonial.findMany();
  for (const t of testimonials) {
    const raw = JSON.stringify(t.photo);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'TESTIMONIAL', id: t.id, name: t.name });
    }
  }

  // 7. Site Settings
  const settings = await prisma.siteSetting.findUnique({ where: { id: 'singleton' } });
  if (settings) {
    const raw = JSON.stringify(settings);
    if (raw.includes(publicId) || raw.includes(url)) {
      usages.push({ entity: 'SITE_SETTINGS', id: 'singleton', name: 'Site Logo / Favicon / OG Image' });
    }
  }

  return usages;
};

export const deleteCloudinaryAsset = async (publicId: string) => {
  try {
    if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    logger.warn(err, `Cloudinary deletion failed for ${publicId}`);
  }
};
