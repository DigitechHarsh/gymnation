const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const plans = await prisma.membershipPlan.findMany();
  const planMap = {};
  plans.forEach(p => planMap[p.slug] = p);

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const data = [
    { name: 'Aarav Desai', phone: '+91 98251 12345', email: 'aarav.desai@gmail.com', plan: 'yearly', startOffset: -60, endOffset: 305, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Priya Shah', phone: '+91 98252 23456', email: 'priya.shah@gmail.com', plan: 'quarterly', startOffset: -20, endOffset: 70, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Rohan Mehta', phone: '+91 98253 34567', email: 'rohan.mehta@gmail.com', plan: 'half-yearly', startOffset: -45, endOffset: 135, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Rahul Patel', phone: '+91 98254 45678', email: 'rahul.patel@gmail.com', plan: 'monthly', startOffset: -25, endOffset: 5, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Kavita Varma', phone: '+91 98255 56789', email: 'kavita.varma@gmail.com', plan: 'monthly', startOffset: -27, endOffset: 3, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Aniket Joshi', phone: '+91 98256 67890', email: 'aniket.joshi@gmail.com', plan: 'yearly', startOffset: -10, endOffset: 355, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Sneha Kulkarni', phone: '+91 98257 78901', email: 'sneha.k@gmail.com', plan: 'half-yearly', startOffset: -174, endOffset: 6, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Devendra Solanki', phone: '+91 98258 89012', email: 'devendra.s@gmail.com', plan: 'quarterly', startOffset: -88, endOffset: 2, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Manish Choksi', phone: '+91 98259 90123', email: 'manish.c@gmail.com', plan: 'monthly', startOffset: -29, endOffset: 1, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Vikram Rathi', phone: '+91 98790 11223', email: 'vikram.r@gmail.com', plan: 'yearly', startOffset: -90, endOffset: 275, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Neha Malani', phone: '+91 98791 22334', email: 'neha.m@gmail.com', plan: 'quarterly', startOffset: -15, endOffset: 75, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Harshil Parekh', phone: '+91 98792 33445', email: 'harshil.p@gmail.com', plan: 'monthly', startOffset: -5, endOffset: 25, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Pooja Jariwala', phone: '+91 98793 44556', email: 'pooja.j@gmail.com', plan: 'half-yearly', startOffset: -30, endOffset: 150, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Yashwant Chauhan', phone: '+91 98794 55667', email: 'yashwant.c@gmail.com', plan: 'yearly', startOffset: -120, endOffset: 245, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Riddhi Surti', phone: '+91 98795 66778', email: 'riddhi.s@gmail.com', plan: 'quarterly', startOffset: -40, endOffset: 50, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Jigar Goti', phone: '+91 98796 77889', email: 'jigar.g@gmail.com', plan: 'monthly', startOffset: -12, endOffset: 18, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Tanvi Ghael', phone: '+91 98797 88990', email: 'tanvi.g@gmail.com', plan: 'monthly', startOffset: -8, endOffset: 22, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Bhavin Mistry', phone: '+91 98798 99001', email: 'bhavin.m@gmail.com', plan: 'half-yearly', startOffset: -80, endOffset: 100, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Darshan Gajera', phone: '+91 98799 00112', email: 'darshan.g@gmail.com', plan: 'yearly', startOffset: -50, endOffset: 315, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Kinjal Patel', phone: '+91 98250 11122', email: 'kinjal.p@gmail.com', plan: 'monthly', startOffset: -3, endOffset: 27, status: 'ACTIVE', source: 'WALK_IN' },
    { name: 'Member Athlete', phone: '+91 85110 31349', email: 'member@gymnation.com', plan: 'yearly', startOffset: -15, endOffset: 350, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Demo User', phone: '+91 85110 31350', email: 'user@gymnation.com', plan: 'half-yearly', startOffset: -10, endOffset: 170, status: 'ACTIVE', source: 'ONLINE' },
    { name: 'Amit Sanghavi', phone: '+91 98241 22334', email: 'amit.s@gmail.com', plan: 'monthly', startOffset: -60, endOffset: -30, status: 'EXPIRED', source: 'WALK_IN' },
    { name: 'Kunal Doshi', phone: '+91 98242 33445', email: 'kunal.d@gmail.com', plan: 'quarterly', startOffset: -120, endOffset: -30, status: 'EXPIRED', source: 'ONLINE' },
    { name: 'Sonal Kapadia', phone: '+91 98243 44556', email: 'sonal.k@gmail.com', plan: 'monthly', startOffset: -45, endOffset: -15, status: 'EXPIRED', source: 'WALK_IN' },
    { name: 'Chirag Morakhia', phone: '+91 98244 55667', email: 'chirag.m@gmail.com', plan: 'half-yearly', startOffset: -210, endOffset: -30, status: 'EXPIRED', source: 'ONLINE' },
    { name: 'Nilesh Zalavadiya', phone: '+91 98245 66778', email: 'nilesh.z@gmail.com', plan: 'monthly', startOffset: -35, endOffset: -5, status: 'EXPIRED', source: 'WALK_IN' },
    { name: 'Pratik Savani', phone: '+91 98246 77889', email: 'pratik.s@gmail.com', plan: 'quarterly', startOffset: -60, endOffset: 30, status: 'CANCELLED', source: 'ONLINE' }
  ];

  await prisma.membershipPurchase.deleteMany({});
  for (const m of data) {
    const selectedPlan = planMap[m.plan] || plans[0];
    const sDate = new Date(now.getTime() + m.startOffset * dayMs);
    const eDate = new Date(now.getTime() + m.endOffset * dayMs);
    await prisma.membershipPurchase.create({
      data: {
        planId: selectedPlan.id,
        name: m.name,
        phone: m.phone,
        email: m.email,
        startDate: sDate,
        endDate: eDate,
        status: m.status,
        source: m.source,
        paymentId: m.source === 'ONLINE' ? 'pay_rzp_' + Math.random().toString(36).substring(2, 10) : 'WALKIN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      }
    });
  }
  const count = await prisma.membershipPurchase.count();
  console.log('Successfully seeded memberships:', count);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
