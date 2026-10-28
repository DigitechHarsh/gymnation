import { PrismaClient, AdminRole, MediaBgType, GalleryType, CouponType, LeadSource, LeadStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GymNation database...');

  // Safe reset of dependent tables
  await prisma.shipment.deleteMany({}).catch(() => {});
  await prisma.payment.deleteMany({}).catch(() => {});
  await prisma.orderItem.deleteMany({}).catch(() => {});
  await prisma.order.deleteMany({}).catch(() => {});
  await prisma.membershipPurchase.deleteMany({}).catch(() => {});
  await prisma.productVariant.deleteMany({}).catch(() => {});
  await prisma.product.deleteMany({}).catch(() => {});
  await prisma.category.deleteMany({}).catch(() => {});
  await prisma.membershipPlan.deleteMany({}).catch(() => {});

  // 1. Super Admin User
  const passwordHash = await bcrypt.hash('Admin@GymNation2026!', 10);
  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@gymnation.in' },
    update: {
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      name: 'GymNation Super Admin',
      email: 'admin@gymnation.in',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log('✓ Admin user seeded:', adminUser.email);

  // 2. Site Setting (Singleton)
  const siteSetting = await prisma.siteSetting.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      gymName: 'GymNation – The Fitness Hub',
      tagline: 'Discipline Builds Freedom',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      email: 'info@gymnation.in',
      address: 'Adajan, Surat, Gujarat 395009, India',
      mapEmbedUrl: 'https://maps.google.com/maps?q=Surat,Gujarat&t=&z=13&ie=UTF8&iwloc=&output=embed',
      workingHours: 'Mon - Sat: 5:30 AM – 10:30 PM | Sun: 6:00 AM – 12:00 PM',
      logo: {
        url: '/gymnationlogo.png',
        publicId: 'gymnation_logo',
        alt: 'GymNation – The Fitness Hub Logo',
      },
      socialLinks: {
        instagram: 'https://instagram.com/gymnation_surat',
        facebook: 'https://facebook.com/gymnationsurat',
        youtube: 'https://youtube.com/@gymnationsurat',
      },
      defaultSeoTitle: 'GymNation – The Fitness Hub | Premium Gym & Supplements in Surat',
      defaultSeoDescription: "Surat's premier fitness hub. High performance training floor, international equipment, certified trainers, and authentic nutritional supplements.",
      footerText: '© 2026 GymNation – The Fitness Hub. All rights reserved.',
      globalOverlayOpacity: 0.55,
      codEnabled: true,
      codFee: 5000, // ₹50 COD fee
      codMaxOrderValue: 1000000, // ₹10,000 max
      freeShippingThreshold: 99900, // ₹999 free shipping
      flatShippingFee: 9900, // ₹99 flat fee
      gstNumber: '24AAAAA0000A1Z5',
      storePickupEnabled: true,
      storePickupAddress: 'GymNation Floor 2, Fitness Boulevard, Adajan, Surat, Gujarat 395009',
      marqueeEnabled: true,
      marqueeSpeed: 28,
      marqueeBgColor: '#7A1F25',
    },
  });
  console.log('✓ Site settings seeded');

  // 3. Hero Slides
  await prisma.heroSlide.deleteMany({});
  await prisma.heroSlide.createMany({
    data: [
      {
        eyebrow: "SURAT'S FITNESS HUB",
        heading: 'DISCIPLINE BUILDS',
        cursiveWord: 'Freedom',
        subText: 'Stronger people. A stronger tomorrow.',
        ctaPrimaryLabel: 'SHOP NOW',
        ctaPrimaryHref: '/products',
        ctaSecondaryLabel: 'JOIN MEMBERSHIP',
        ctaSecondaryHref: '/membership',
        rightImage: {
          url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000',
          publicId: 'hero_athlete_1',
          alt: 'GymNation Athlete in Training',
        },
        bgType: MediaBgType.VIDEO,
        bgMedia: {
          url: '/video.mp4',
          publicId: 'local_cinematic_hero_video',
          alt: 'Cinematic Gym Floor Video',
        },
        overlayOpacity: 0.55,
        offerBadgeText: 'FLAT 30% OFF',
        offerBadgeSubtext: 'ON ALL SUPPLEMENTS',
        isActive: true,
        sortOrder: 1,
      },
      {
        eyebrow: 'WORLD CLASS FITNESS',
        heading: 'TRANSFORM YOUR',
        cursiveWord: 'Strength',
        subText: 'State of the art biomechanics equipment with certified coaches.',
        ctaPrimaryLabel: 'VIEW PLANS',
        ctaPrimaryHref: '/membership',
        ctaSecondaryLabel: 'BOOK FREE TRIAL',
        ctaSecondaryHref: '/contact',
        rightImage: {
          url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000',
          publicId: 'hero_athlete_2',
          alt: 'Strength Training Athlete',
        },
        bgType: MediaBgType.IMAGE,
        bgMedia: {
          url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600',
          publicId: 'gym_floor_wide',
          alt: 'Gym Training Floor',
        },
        overlayOpacity: 0.6,
        offerBadgeText: 'FREE 1-DAY PASS',
        offerBadgeSubtext: 'EXPERIENCE THE HUB',
        isActive: true,
        sortOrder: 2,
      },
      {
        eyebrow: 'AUTHENTIC NUTRITION',
        heading: 'FUEL YOUR',
        cursiveWord: 'Performance',
        subText: '100% lab-tested whey, creatine & pre-workouts delivered straight to your door.',
        ctaPrimaryLabel: 'EXPLORE SUPPLEMENTS',
        ctaPrimaryHref: '/products',
        ctaSecondaryLabel: 'GET DIET GUIDE',
        ctaSecondaryHref: '/contact',
        rightImage: {
          url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=1000',
          publicId: 'hero_protein_tub',
          alt: 'GymNation Whey Protein Container',
        },
        bgType: MediaBgType.IMAGE,
        bgMedia: {
          url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600',
          publicId: 'weights_rack',
          alt: 'Dumbbells and Weights',
        },
        overlayOpacity: 0.55,
        offerBadgeText: 'CODE: GYMNATION25',
        offerBadgeSubtext: 'GET 25% OFF NOW',
        isActive: true,
        sortOrder: 3,
      },
    ],
  });
  console.log('✓ Hero slides seeded');

  // 4. Marquee Offers
  await prisma.marqueeOffer.deleteMany({});
  await prisma.marqueeOffer.createMany({
    data: [
      { text: 'FLAT 25% OFF ON PROTEIN', sortOrder: 1, isActive: true },
      { text: 'USE CODE GYMNATION25', sortOrder: 2, isActive: true },
      { text: 'FREE SHIPPING ABOVE ₹999', sortOrder: 3, isActive: true },
      { text: 'NEW MEMBERSHIP OFFERS AVAILABLE', sortOrder: 4, isActive: true },
      { text: '100% AUTHENTIC LAB-TESTED SUPPLEMENTS', sortOrder: 5, isActive: true },
    ],
  });
  console.log('✓ Marquee offers seeded');

  // 5. Stats
  await prisma.stat.deleteMany({});
  await prisma.stat.createMany({
    data: [
      { label: 'MEMBERS', value: '1500', suffix: '+', sortOrder: 1 },
      { label: 'TRAINERS', value: '25', suffix: '+', sortOrder: 2 },
      { label: 'YEARS OF EXCELLENCE', value: '8', suffix: '+', sortOrder: 3 },
    ],
  });
  console.log('✓ Stats seeded');

  // 6. Why Us Items
  await prisma.whyUsItem.deleteMany({});
  await prisma.whyUsItem.createMany({
    data: [
      {
        number: '01',
        title: 'EXPERT TRAINERS',
        description: 'Certified coaches who design progressive training regimens tailored to your specific anatomy and goals.',
        media: { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800', publicId: 'why_01' },
        sortOrder: 1,
        isActive: true,
      },
      {
        number: '02',
        title: 'PREMIUM EQUIPMENT',
        description: 'Imported biomechanically calibrated equipment and precision free weights built for maximum muscle engagement.',
        media: { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800', publicId: 'why_02' },
        sortOrder: 2,
        isActive: true,
      },
      {
        number: '03',
        title: 'CLEAN AND SAFE FLOOR',
        description: 'Hospital-grade sanitization protocols carried out constantly to ensure pristine hygiene across all zones.',
        media: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', publicId: 'why_03' },
        sortOrder: 3,
        isActive: true,
      },
      {
        number: '04',
        title: 'PERSONAL SUPPORT',
        description: 'Comprehensive nutritional counseling, body scans, and dedicated accountability from day one until your victory.',
        media: { url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800', publicId: 'why_04' },
        sortOrder: 4,
        isActive: true,
      },
      {
        number: '05',
        title: 'FLEXIBLE PLANS',
        description: 'No hidden lock-ins. Adaptable memberships with freeze options created to support your lifestyle and travels.',
        media: { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800', publicId: 'why_05' },
        sortOrder: 5,
        isActive: true,
      },
    ],
  });
  console.log('✓ Why Us items seeded');

  // 7. Page Sections (About Us & Why Us)
  await prisma.pageSection.deleteMany({});
  await prisma.pageSection.createMany({
    data: [
      {
        pageSlug: 'about-us',
        sectionKey: 'story',
        title: 'OUR STORY',
        cursiveWord: 'more than a gym',
        body: 'A training ground for people who choose discipline, consistency and a healthier lifestyle, with a community that keeps you showing up day after day.',
        media: [
          { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200', publicId: 'story_gym_interior', alt: 'Gym Interior' },
        ],
        ctaLabel: 'MEET THE TRAINERS',
        ctaHref: '#team',
        sortOrder: 1,
        isActive: true,
      },
      {
        pageSlug: 'about-us',
        sectionKey: 'vision',
        title: 'OUR VISION',
        cursiveWord: 'Inspiring Surat',
        body: 'Build a stronger, healthier, and more confident community in Surat through accessible, science-backed fitness.',
        sortOrder: 2,
        isActive: true,
      },
      {
        pageSlug: 'about-us',
        sectionKey: 'mission',
        title: 'OUR MISSION',
        cursiveWord: 'Excellence Everyday',
        body: 'Make fitness accessible, engaging, and deeply impactful for everyone regardless of starting point.',
        sortOrder: 3,
        isActive: true,
      },
      {
        pageSlug: 'about-us',
        sectionKey: 'cta_band',
        title: 'READY TO START?',
        cursiveWord: 'Join The Tribe',
        body: 'Take the first step toward the most resilient version of yourself.',
        ctaLabel: 'JOIN NOW',
        ctaHref: '/membership',
        sortOrder: 4,
        isActive: true,
      },
    ],
  });
  console.log('✓ Page sections seeded');

  // 8. Membership Plans
  await prisma.membershipPlan.deleteMany({});
  await prisma.membershipPlan.createMany({
    data: [
      {
        name: 'MONTHLY',
        slug: 'monthly',
        price: 249900, // ₹2,499
        mrp: 349900,
        durationDays: 30,
        durationLabel: 'per month',
        features: ['Full Gym Access', 'All Equipment & Cardio Zone', 'Locker & Shower Access', 'Basic Support & Orientation'],
        isPopular: false,
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'QUARTERLY',
        slug: 'quarterly',
        price: 649900, // ₹6,499
        mrp: 899900,
        durationDays: 90,
        durationLabel: '₹2,166 per month',
        features: ['Full Gym Access', 'All Equipment & Free Weights Zone', 'Locker & Steam Access', '1 Free Diet Consultation', '1 InBody Composition Scan'],
        isPopular: true,
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'HALF YEARLY',
        slug: 'half-yearly',
        price: 1149900, // ₹11,499
        mrp: 1599900,
        durationDays: 180,
        durationLabel: '₹1,916 per month',
        features: ['Full Gym Access', 'Priority Trainer Guidance', 'Personal Dedicated Locker', 'Monthly InBody Scans', 'Custom Workout Routine'],
        isPopular: false,
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'YEARLY',
        slug: 'yearly',
        price: 1999900, // ₹19,999
        mrp: 2999900,
        durationDays: 365,
        durationLabel: '₹1,666 per month',
        features: ['Full 365-Day Access', 'Unlimited InBody Scans', 'Dedicated Locker Access', 'Complimentary GymNation Kit', '5 Guest Day Passes', '1 Free Freeze Month'],
        isPopular: false,
        isActive: true,
        sortOrder: 4,
      },
    ],
  });
  console.log('✓ Membership plans seeded');

  // 8.1 Membership Purchases (Seed realistic active, expiring soon and walk-in passes)
  const createdPlans = await prisma.membershipPlan.findMany();
  const pMap: Record<string, any> = {};
  createdPlans.forEach((p) => (pMap[p.slug] = p));
  const nowTime = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const sampleMembers = [
    { name: 'Aarav Desai', phone: '+91 98251 12345', email: 'aarav.desai@gmail.com', plan: 'yearly', startOffset: -60, endOffset: 305, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Priya Shah', phone: '+91 98252 23456', email: 'priya.shah@gmail.com', plan: 'quarterly', startOffset: -20, endOffset: 70, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Rohan Mehta', phone: '+91 98253 34567', email: 'rohan.mehta@gmail.com', plan: 'half-yearly', startOffset: -45, endOffset: 135, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Rahul Patel', phone: '+91 98254 45678', email: 'rahul.patel@gmail.com', plan: 'monthly', startOffset: -25, endOffset: 5, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Kavita Varma', phone: '+91 98255 56789', email: 'kavita.varma@gmail.com', plan: 'monthly', startOffset: -27, endOffset: 3, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Aniket Joshi', phone: '+91 98256 67890', email: 'aniket.joshi@gmail.com', plan: 'yearly', startOffset: -10, endOffset: 355, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Sneha Kulkarni', phone: '+91 98257 78901', email: 'sneha.k@gmail.com', plan: 'half-yearly', startOffset: -174, endOffset: 6, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Devendra Solanki', phone: '+91 98258 89012', email: 'devendra.s@gmail.com', plan: 'quarterly', startOffset: -88, endOffset: 2, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Manish Choksi', phone: '+91 98259 90123', email: 'manish.c@gmail.com', plan: 'monthly', startOffset: -29, endOffset: 1, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Vikram Rathi', phone: '+91 98790 11223', email: 'vikram.r@gmail.com', plan: 'yearly', startOffset: -90, endOffset: 275, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Neha Malani', phone: '+91 98791 22334', email: 'neha.m@gmail.com', plan: 'quarterly', startOffset: -15, endOffset: 75, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Harshil Parekh', phone: '+91 98792 33445', email: 'harshil.p@gmail.com', plan: 'monthly', startOffset: -5, endOffset: 25, status: 'ACTIVE' as const, source: 'WALK_IN' as const },
    { name: 'Member Athlete', phone: '+91 85110 31349', email: 'member@gymnation.com', plan: 'yearly', startOffset: -15, endOffset: 350, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Demo User', phone: '+91 85110 31350', email: 'user@gymnation.com', plan: 'half-yearly', startOffset: -10, endOffset: 170, status: 'ACTIVE' as const, source: 'ONLINE' as const },
    { name: 'Amit Sanghavi', phone: '+91 98241 22334', email: 'amit.s@gmail.com', plan: 'monthly', startOffset: -60, endOffset: -30, status: 'EXPIRED' as const, source: 'WALK_IN' as const },
    { name: 'Kunal Doshi', phone: '+91 98242 33445', email: 'kunal.d@gmail.com', plan: 'quarterly', startOffset: -120, endOffset: -30, status: 'EXPIRED' as const, source: 'ONLINE' as const },
    { name: 'Pratik Savani', phone: '+91 98246 77889', email: 'pratik.s@gmail.com', plan: 'quarterly', startOffset: -60, endOffset: 30, status: 'CANCELLED' as const, source: 'ONLINE' as const },
  ];

  await prisma.membershipPurchase.deleteMany({});
  for (const sm of sampleMembers) {
    const matchedPlan = pMap[sm.plan] || createdPlans[0];
    await prisma.membershipPurchase.create({
      data: {
        planId: matchedPlan.id,
        name: sm.name,
        phone: sm.phone,
        email: sm.email,
        startDate: new Date(nowTime.getTime() + sm.startOffset * oneDay),
        endDate: new Date(nowTime.getTime() + sm.endOffset * oneDay),
        status: sm.status,
        source: sm.source,
        paymentId: sm.source === 'ONLINE' ? 'pay_rzp_' + Math.random().toString(36).substring(2, 9) : 'WALKIN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      },
    });
  }
  console.log('✓ Membership purchases seeded');

  // 9. Gallery Items
  await prisma.galleryItem.deleteMany({});
  await prisma.galleryItem.createMany({
    data: [
      {
        type: GalleryType.IMAGE,
        category: 'EQUIPMENT',
        caption: 'Olympic Racks & Heavy Dumbbell Zone',
        media: { url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800', publicId: 'gallery_eq_1' },
        sortOrder: 1,
        isActive: true,
      },
      {
        type: GalleryType.IMAGE,
        category: 'WORKOUTS',
        caption: 'High Intensity Conditioning Floor',
        media: { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800', publicId: 'gallery_wo_1' },
        sortOrder: 2,
        isActive: true,
      },
      {
        type: GalleryType.IMAGE,
        category: 'MEMBERS',
        caption: 'Morning Training Squad & Community',
        media: { url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800', publicId: 'gallery_mem_1' },
        sortOrder: 3,
        isActive: true,
      },
      {
        type: GalleryType.IMAGE,
        category: 'EVENTS',
        caption: 'Surat Deadlift Championship 2026',
        media: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800', publicId: 'gallery_ev_1' },
        sortOrder: 4,
        isActive: true,
      },
      {
        type: GalleryType.VIDEO,
        category: 'WORKOUTS',
        caption: 'Scrubbed Cinematic Gym Floor Reel',
        media: { url: '/video.mp4', publicId: 'gallery_vid_1' },
        sortOrder: 5,
        isActive: true,
      },
    ],
  });
  console.log('✓ Gallery items seeded');

  // 10. Testimonials
  await prisma.testimonial.deleteMany({});
  await prisma.testimonial.createMany({
    data: [
      {
        name: 'Rahul Varma',
        role: 'Lost 18 kg in 6 Months',
        quote: 'GymNation changed my lifestyle completely. The coaches keep you accountable, and the equipment is top notch. Best fitness atmosphere in Surat!',
        photo: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400', publicId: 'test_1' },
        rating: 5,
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Pooja Patel',
        role: 'Strength & Mobility Client',
        quote: 'Clean floor, respectful community, and truly knowledgeable trainers who care about proper form. I have never felt stronger.',
        photo: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400', publicId: 'test_2' },
        rating: 5,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Amit Desai',
        role: 'Powerlifting Competitor',
        quote: 'Finding calibrated plates and heavy-duty power racks in Surat was tough until GymNation opened. Also love their authentic whey supplements store!',
        photo: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400', publicId: 'test_3' },
        rating: 5,
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Neha Shah',
        role: 'Corporate Athlete',
        quote: 'Working 10-hour desk jobs gave me chronic back pain. 3 months into functional training at GymNation, my posture and energy levels are unmatched.',
        photo: { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400', publicId: 'test_4' },
        rating: 5,
        sortOrder: 4,
        isActive: true,
      },
    ],
  });
  console.log('✓ Testimonials seeded');

  // 11. FAQs
  await prisma.faqItem.deleteMany({});
  await prisma.faqItem.createMany({
    data: [
      {
        question: 'What membership plans are available?',
        answer: 'We offer Monthly (₹2,499), Quarterly (₹6,499), Half-Yearly (₹11,499) and Yearly (₹19,999) memberships. Each membership includes complete access to training floors, lockers, showers and fitness assessments.',
        category: 'MEMBERSHIP',
        sortOrder: 1,
        isActive: true,
      },
      {
        question: 'What are the gym timings?',
        answer: 'GymNation is open Monday through Saturday from 5:30 AM to 10:30 PM. On Sundays, we are open from 6:00 AM to 12:00 PM.',
        category: 'FACILITY',
        sortOrder: 2,
        isActive: true,
      },
      {
        question: 'Do you offer personal training?',
        answer: 'Yes! We have certified personal trainers specializing in fat loss, muscle hypertrophy, sports conditioning, and injury rehabilitation. You can request a personalized trainer assignment at our reception desk or online.',
        category: 'TRAINING',
        sortOrder: 3,
        isActive: true,
      },
      {
        question: 'Can I freeze my membership?',
        answer: 'Yes. Annual members receive 1 complimentary freeze month for medical reasons or work travel. Shorter plans can also be frozen for a nominal administrative fee.',
        category: 'MEMBERSHIP',
        sortOrder: 4,
        isActive: true,
      },
      {
        question: 'What is your refund policy?',
        answer: 'Supplement orders can be returned within 7 days of delivery if seals are intact and original packaging is unopened. Membership fees are non-refundable but transferable to family members upon approval.',
        category: 'POLICIES',
        sortOrder: 5,
        isActive: true,
      },
      {
        question: 'Do you sell supplements online?',
        answer: 'Yes, we are the official single-vendor distributor for 100% authentic, batch-tested whey proteins, creatine, pre-workouts, and workout essentials with direct doorstep delivery across India and local store pickup in Surat.',
        category: 'SUPPLEMENTS',
        sortOrder: 6,
        isActive: true,
      },
      {
        question: 'How long does delivery take?',
        answer: 'Orders within Surat are delivered within 24 hours (or available for immediate store pickup). Across Gujarat and Pan-India, orders are shipped via Shiprocket expedited courier and delivered in 2–4 business days.',
        category: 'SHIPPING',
        sortOrder: 7,
        isActive: true,
      },
      {
        question: 'How can I contact Gymnation?',
        answer: 'You can call us directly at +91 98765 43210, WhatsApp us on the same number, or email info@gymnation.in. Our gym is located at Adajan, Surat, Gujarat 395009.',
        category: 'GENERAL',
        sortOrder: 8,
        isActive: true,
      },
    ],
  });
  console.log('✓ FAQs seeded');

  // 12. Categories & Products
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  const catProtein = await prisma.category.create({
    data: {
      name: 'Whey Protein',
      slug: 'protein',
      description: 'Ultra-filtered whey isolate and concentrate for maximum muscle synthesis and rapid recovery.',
      image: { url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=600', publicId: 'cat_protein' },
      sortOrder: 1,
      isActive: true,
    },
  });

  const catCreatine = await prisma.category.create({
    data: {
      name: 'Creatine',
      slug: 'creatine',
      description: 'Pure micronized creatine monohydrate to enhance ATP recycling, explosive strength, and cellular hydration.',
      image: { url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600', publicId: 'cat_creatine' },
      sortOrder: 2,
      isActive: true,
    },
  });

  const catPreWorkout = await prisma.category.create({
    data: {
      name: 'Pre-Workout',
      slug: 'pre-workout',
      description: 'High-octane formulas designed for razor-sharp focus, nitric oxide blood flow pumps, and fatigue resistance.',
      image: { url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=600', publicId: 'cat_preworkout' },
      sortOrder: 3,
      isActive: true,
    },
  });

  const catMassGainer = await prisma.category.create({
    data: {
      name: 'Mass Gainer',
      slug: 'mass-gainer',
      description: 'Clean carbohydrate and multi-stage protein blends formulated for lean bulk and hardgainers.',
      image: { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600', publicId: 'cat_massgainer' },
      sortOrder: 4,
      isActive: true,
    },
  });

  const catApparel = await prisma.category.create({
    data: {
      name: 'Apparel',
      slug: 'apparel',
      description: 'Performance-engineered athletic wear designed for breathability and freedom of movement.',
      image: { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600', publicId: 'cat_apparel' },
      sortOrder: 5,
      isActive: true,
    },
  });

  const catAccessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Shaker bottles, lifting straps, wrist wraps, and gym essentials.',
      image: { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600', publicId: 'cat_accessories' },
      sortOrder: 6,
      isActive: true,
    },
  });
  console.log('✓ Categories seeded');

  // Products with variants
  const prodWhey = await prisma.product.create({
    data: {
      name: 'GymNation 100% Gold Whey Protein',
      slug: 'gymnation-gold-whey-protein',
      brand: 'GymNation Nutrition',
      shortDescription: '25g Protein, 5.5g BCAAs, 4g Glutamine per scoop with digestive enzymes for zero bloating.',
      description: `<h3>Engineered for Pure Muscle Growth</h3>
<p>GymNation 100% Gold Whey Protein is an ultra-pure whey protein isolate and concentrate blend. Tested by independent third-party laboratories, each scoop delivers 25g of high-bioavailability protein to fuel muscle recovery, repair micro-tears from training, and stimulate MPS (Muscle Protein Synthesis).</p>
<h4>Key Highlights:</h4>
<ul>
  <li>25g pure protein per serving</li>
  <li>Enhanced with DigeZyme® digestive enzyme complex</li>
  <li>Zero added sugar, gluten-free and banned substance tested</li>
  <li>Fast dissolving with smooth texture in water or milk</li>
</ul>`,
      categoryId: catProtein.id,
      price: 299900, // ₹2,999 base
      mrp: 359900,
      sku: 'GN-WHEY-GOLD',
      hsnCode: '21069099',
      gstRate: 18.0,
      weightGrams: 1000,
      lengthCm: 18,
      breadthCm: 18,
      heightCm: 28,
      badge: '-17%',
      isFeatured: true,
      isActive: true,
      seoTitle: 'GymNation 100% Gold Whey Protein | Buy Authentic Whey in Surat',
      seoDescription: 'Order GymNation 100% Gold Whey Protein online in Surat with express delivery. 25g protein per scoop, lab-tested.',
      images: [
        { url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800', publicId: 'prod_whey_1', alt: 'GymNation Whey Front' },
        { url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800', publicId: 'prod_whey_2', alt: 'Nutrition Facts Label' },
      ],
      variants: {
        create: [
          { label: 'Chocolate / 1 kg', flavour: 'Chocolate', size: '1 kg', sku: 'GN-WHEY-CHOC-1KG', price: 299900, mrp: 359900, stock: 45, weightGrams: 1000, isActive: true },
          { label: 'Chocolate / 2 kg', flavour: 'Chocolate', size: '2 kg', sku: 'GN-WHEY-CHOC-2KG', price: 549900, mrp: 699900, stock: 30, weightGrams: 2000, isActive: true },
          { label: 'Vanilla / 1 kg', flavour: 'Vanilla', size: '1 kg', sku: 'GN-WHEY-VAN-1KG', price: 299900, mrp: 359900, stock: 25, weightGrams: 1000, isActive: true },
          { label: 'Strawberry / 1 kg', flavour: 'Strawberry', size: '1 kg', sku: 'GN-WHEY-STR-1KG', price: 299900, mrp: 359900, stock: 15, weightGrams: 1000, isActive: true },
        ],
      },
    },
  });

  const prodCreatine = await prisma.product.create({
    data: {
      name: 'GymNation Micronized Creatine Monohydrate',
      slug: 'gymnation-micronized-creatine',
      brand: 'GymNation Nutrition',
      shortDescription: '100% Creapure® grade micronized creatine monohydrate for raw power, ATP recovery and lean muscle fullness.',
      description: `<h3>Unleash Explosive Strength</h3>
<p>GymNation Creatine Monohydrate is micronized to 200 mesh for instantaneous dissolution in water. Creatine increases phosphocreatine stores in your muscle fibers, allowing higher workloads and rapid recovery between explosive sets.</p>`,
      categoryId: catCreatine.id,
      price: 99900, // ₹999
      mrp: 124900,
      sku: 'GN-CREA-MIC',
      hsnCode: '21069099',
      gstRate: 18.0,
      weightGrams: 250,
      badge: '-20%',
      isFeatured: true,
      isActive: true,
      seoTitle: 'Micronized Creatine Monohydrate | GymNation Surat',
      seoDescription: 'Boost athletic performance with GymNation Micronized Creatine. Pure, unflavored, no fillers.',
      images: [
        { url: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800', publicId: 'prod_creatine_1', alt: 'Creatine Tub' },
      ],
      variants: {
        create: [
          { label: 'Unflavoured / 250 g', flavour: 'Unflavoured', size: '250 g', sku: 'GN-CREA-UNFL-250G', price: 99900, mrp: 124900, stock: 60, weightGrams: 250, isActive: true },
          { label: 'Unflavoured / 500 g', flavour: 'Unflavoured', size: '500 g', sku: 'GN-CREA-UNFL-500G', price: 179900, mrp: 229900, stock: 40, weightGrams: 500, isActive: true },
        ],
      },
    },
  });

  const prodPreWorkout = await prisma.product.create({
    data: {
      name: 'GymNation Ignite Pre-Workout Matrix',
      slug: 'gymnation-ignite-pre-workout',
      brand: 'GymNation Nutrition',
      shortDescription: 'Caffeine Anhydrous, L-Citrulline Malate, Beta-Alanine, and Electrolytes for intense energy and skin-splitting pumps.',
      description: `<h3>Maximum Laser Focus & Blood Flow</h3>
<p>Formulated for intense sessions. 300mg Caffeine combined with 6g L-Citrulline Malate and 3.2g Beta-Alanine guarantees unmatched mental clarity and zero post-workout crash.</p>`,
      categoryId: catPreWorkout.id,
      price: 189900, // ₹1,899
      mrp: 224900,
      sku: 'GN-PRE-IGNITE',
      hsnCode: '21069099',
      gstRate: 18.0,
      weightGrams: 300,
      badge: '-15%',
      isFeatured: true,
      isActive: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=800', publicId: 'prod_pre_1', alt: 'Pre-Workout Container' },
      ],
      variants: {
        create: [
          { label: 'Blue Raspberry / 300 g', flavour: 'Blue Raspberry', size: '300 g', sku: 'GN-PRE-BLUE-300G', price: 189900, mrp: 224900, stock: 35, weightGrams: 300, isActive: true },
          { label: 'Watermelon / 300 g', flavour: 'Watermelon', size: '300 g', sku: 'GN-PRE-WAT-300G', price: 189900, mrp: 224900, stock: 20, weightGrams: 300, isActive: true },
        ],
      },
    },
  });

  const prodMassGainer = await prisma.product.create({
    data: {
      name: 'GymNation Heavy Mass Gainer',
      slug: 'gymnation-heavy-mass-gainer',
      brand: 'GymNation Nutrition',
      shortDescription: '1,250 Calories, 50g Protein, and 250g Clean Carbohydrates per serving for accelerated mass building.',
      description: `<p>The ultimate mass gainer for hardgainers and high-metabolism athletes seeking serious size and strength.</p>`,
      categoryId: catMassGainer.id,
      price: 349900, // ₹3,499
      mrp: 389900,
      sku: 'GN-MASS-3KG',
      hsnCode: '21069099',
      gstRate: 18.0,
      weightGrams: 3000,
      badge: '-10%',
      isFeatured: true,
      isActive: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800', publicId: 'prod_mass_1', alt: 'Mass Gainer Tub' },
      ],
      variants: {
        create: [
          { label: 'Chocolate Fudge / 3 kg', flavour: 'Chocolate Fudge', size: '3 kg', sku: 'GN-MASS-CHOC-3KG', price: 349900, mrp: 389900, stock: 25, weightGrams: 3000, isActive: true },
        ],
      },
    },
  });

  const prodTshirt = await prisma.product.create({
    data: {
      name: 'GymNation Pro Performance T-Shirt',
      slug: 'gymnation-pro-performance-tshirt',
      brand: 'GymNation Wear',
      shortDescription: 'Athletic fit, breathable 4-way stretch fabric with anti-odor silver ion technology.',
      description: `<p>Designed specifically for lifting heavy. Deep armhole cut and tapered waist highlight your physique while keeping you cool.</p>`,
      categoryId: catApparel.id,
      price: 89900, // ₹899
      mrp: 119900,
      sku: 'GN-WEAR-TSHIRT',
      hsnCode: '61091000',
      gstRate: 12.0,
      weightGrams: 200,
      badge: '-25%',
      isFeatured: false,
      isActive: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800', publicId: 'prod_tshirt_1', alt: 'GymNation Performance T-Shirt' },
      ],
      variants: {
        create: [
          { label: 'Black / M', flavour: 'Black', size: 'M', sku: 'GN-TSHIRT-BLK-M', price: 89900, mrp: 119900, stock: 20, weightGrams: 200, isActive: true },
          { label: 'Black / L', flavour: 'Black', size: 'L', sku: 'GN-TSHIRT-BLK-L', price: 89900, mrp: 119900, stock: 30, weightGrams: 200, isActive: true },
          { label: 'Black / XL', flavour: 'Black', size: 'XL', sku: 'GN-TSHIRT-BLK-XL', price: 89900, mrp: 119900, stock: 15, weightGrams: 200, isActive: true },
        ],
      },
    },
  });

  const prodShaker = await prisma.product.create({
    data: {
      name: 'GymNation Stainless Steel Shaker Bottle 750ml',
      slug: 'gymnation-stainless-shaker-750ml',
      brand: 'GymNation Wear',
      shortDescription: 'Leakproof double-wall vacuum insulated stainless steel shaker bottle keeping shakes ice-cold for 12 hours.',
      description: `<p>Ditch plastic shakers. Surgical grade stainless steel eliminates lingering supplement odors and stays freezing cold all workout long.</p>`,
      categoryId: catAccessories.id,
      price: 69900, // ₹699
      mrp: 79900,
      sku: 'GN-ACC-SHAKER',
      hsnCode: '73239390',
      gstRate: 18.0,
      weightGrams: 350,
      badge: '-12%',
      isFeatured: false,
      isActive: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800', publicId: 'prod_shaker_1', alt: 'Stainless Steel Shaker' },
      ],
      variants: {
        create: [
          { label: 'Matte Black / 750 ml', flavour: 'Matte Black', size: '750 ml', sku: 'GN-SHAKER-BLK-750', price: 69900, mrp: 79900, stock: 50, weightGrams: 350, isActive: true },
        ],
      },
    },
  });
  console.log('✓ Products & Variants seeded');

  // 13. Coupons
  await prisma.coupon.deleteMany({});
  await prisma.coupon.createMany({
    data: [
      {
        code: 'GYMNATION25',
        type: CouponType.PERCENT,
        value: 25, // 25%
        minOrderValue: 99900, // ₹999 min
        maxDiscount: 50000, // ₹500 cap
        usageLimit: 1000,
        perUserLimit: 2,
        isActive: true,
      },
      {
        code: 'WELCOME10',
        type: CouponType.PERCENT,
        value: 10,
        minOrderValue: 49900,
        maxDiscount: 25000,
        usageLimit: 5000,
        perUserLimit: 1,
        isActive: true,
      },
      {
        code: 'FLAT200',
        type: CouponType.FLAT,
        value: 20000, // ₹200 flat
        minOrderValue: 149900, // ₹1,499 min
        usageLimit: 500,
        perUserLimit: 1,
        isActive: true,
      },
    ],
  });
  console.log('✓ Coupons seeded');

  // 14. Sample Leads
  await prisma.lead.deleteMany({});
  await prisma.lead.createMany({
    data: [
      {
        name: 'Vikas Sharma',
        phone: '+91 98250 11223',
        email: 'vikas.sharma@example.com',
        message: 'Interested in personal training for weight loss and muscle building.',
        goal: 'Weight Loss & Hypertrophy',
        source: LeadSource.CONTACT,
        status: LeadStatus.NEW,
        notes: 'Requested callback after 6 PM',
      },
      {
        name: 'Darshan Joshi',
        phone: '+91 97230 44556',
        email: 'darshan.j@example.com',
        message: 'Looking for annual membership details for 2 persons.',
        goal: 'General Fitness',
        source: LeadSource.HERO,
        status: LeadStatus.CONTACTED,
        assignedTo: 'Sales Desk',
        notes: 'Sent WhatsApp brochure with annual couple discount',
      },
    ],
  });
  console.log('✓ Sample leads seeded');

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
