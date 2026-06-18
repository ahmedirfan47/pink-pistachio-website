import { PrismaClient, BannerType, CouponType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const img = (id: string) =>
  'https://images.unsplash.com/' + id + '?q=80&w=900&auto=format&fit=crop';

async function main() {
  console.log('Seeding Pink Pistachio database...');

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@pinkpistachio.pk';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeThisPassword123!';
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.ADMIN_NAME ?? 'Pink Pistachio Admin',
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      phone: '+92 300 1234567',
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      siteName: 'Pink Pistachio',
      tagline: 'Boutique Cafe & Patisserie',
      primaryPhone: '+92 300 1234567',
      primaryEmail: 'hello@pinkpistachio.pk',
      whatsappNumber: '+92 300 1234567',
      instagramUrl: 'https://www.instagram.com/pistachio.pink',
      facebookUrl: 'https://www.facebook.com/pistachio.pink',
      deliveryFee: 150,
      freeDeliveryMin: 3000,
      aboutText: 'Pink Pistachio began with a simple idea: bring a little European patisserie magic to Lahore, wrapped in soft pink and pistachio green. From our kitchens in DHA Raya and Gulberg, we bake fresh every morning - vintage butter cream cakes, flaky croissants, artisanal sourdough, and an all-day menu of brunch, salads, and savoury bites. Every plate is made with the same obsession for detail that goes into our interiors: pretty, considered, and made to be shared.',
    },
  });

  const categoriesData = [
    { name: 'Specialty Coffee', slug: 'specialty-coffee', description: 'Espresso-based drinks and signature lattes, roasted and brewed in house.', image: img('photo-1495474472287-4d71bcdd2085'), position: 1 },
    { name: 'Croissants & Pastries', slug: 'croissants-pastries', description: 'Laminated, butter-rich pastries baked fresh every morning.', image: img('photo-1555507036-ab1f4038808a'), position: 2 },
    { name: 'Signature Cakes', slug: 'signature-cakes', description: 'Vintage butter cream cakes and patisserie classics, by the slice or whole.', image: img('photo-1565958011703-44f9829ba187'), position: 3 },
    { name: 'Artisan Bread', slug: 'artisan-bread', description: 'Slow-fermented sourdough and European-style loaves.', image: img('photo-1549931319-a545d471dad4'), position: 4 },
    { name: 'All-Day Brunch', slug: 'all-day-brunch', description: 'Hearty brunch plates served from open to close.', image: img('photo-1482049016688-2d3e1b311543'), position: 5 },
    { name: 'Sandwiches & Baguettes', slug: 'sandwiches-baguettes', description: 'Stacked sandwiches and freshly baked baguettes.', image: img('photo-1481833761820-0509d3217039'), position: 6 },
    { name: 'Seasonal Salads', slug: 'seasonal-salads', description: 'Crisp, colourful salads made with seasonal produce.', image: img('photo-1551782450-a2132b4ba21d'), position: 7 },
    { name: 'Savoury Bites', slug: 'savoury-bites', description: 'Puffs, sticks and loaded fries for sharing.', image: img('photo-1573080496219-bb080dd4f877'), position: 8 },
    { name: 'Cupcakes & Cookies', slug: 'cupcakes-cookies', description: 'Pretty little bakes - cupcakes, cookies and macarons.', image: img('photo-1517248135467-4c7edcad34c4'), position: 9 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    categories[c.slug] = created.id;
  }

  const productsData = [
    { name: 'Pistachio Latte', slug: 'pistachio-latte', description: 'Our signature drink - double espresso, steamed milk and house-made pistachio cream, finished with crushed pistachios.', price: 950, compareAtPrice: null, images: [img('photo-1517701604599-bb29b565090c')], categorySlug: 'specialty-coffee', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['signature', 'bestseller'] },
    { name: 'Rose Cardamom Cappuccino', slug: 'rose-cardamom-cappuccino', description: 'Velvety cappuccino infused with cardamom and a whisper of rose syrup.', price: 850, compareAtPrice: null, images: [img('photo-1572442388796-11668a67e53d')], categorySlug: 'specialty-coffee', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['signature'] },
    { name: 'Classic Cappuccino', slug: 'classic-cappuccino', description: 'Double shot espresso topped with silky steamed milk foam.', price: 750, compareAtPrice: null, images: [img('photo-1572442388796-11668a67e53d')], categorySlug: 'specialty-coffee', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Cafe Latte', slug: 'cafe-latte', description: 'Smooth espresso balanced with steamed milk and a light layer of foam.', price: 780, compareAtPrice: null, images: [img('photo-1485808191679-5f86510681a2')], categorySlug: 'specialty-coffee', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Iced Spanish Latte', slug: 'iced-spanish-latte', description: 'Espresso poured over ice with sweet condensed milk for a rich, cooling sip.', price: 850, compareAtPrice: null, images: [img('photo-1461023058943-07fcbe16d735')], categorySlug: 'specialty-coffee', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['iced'] },
    { name: 'Matcha Latte', slug: 'matcha-latte', description: 'Ceremonial-grade matcha whisked with steamed milk, lightly sweetened.', price: 900, compareAtPrice: null, images: [img('photo-1515823064-d6e0c04616a7')], categorySlug: 'specialty-coffee', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: ['iced'] },
    { name: 'Cold Brew', slug: 'cold-brew', description: 'Slow-steeped for 18 hours for a smooth, low-acid finish.', price: 800, compareAtPrice: null, images: [img('photo-1461023058943-07fcbe16d735')], categorySlug: 'specialty-coffee', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: ['iced'] },
    { name: 'Hot Chocolate', slug: 'hot-chocolate', description: 'Rich Belgian chocolate melted into steamed milk, topped with whipped cream.', price: 820, compareAtPrice: null, images: [img('photo-1542990253-0d0f5be5f0ed')], categorySlug: 'specialty-coffee', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Butter Croissant', slug: 'butter-croissant', description: 'Classic French croissant, laminated over 3 days for a shatter-crisp finish.', price: 450, compareAtPrice: null, images: [img('photo-1555507036-ab1f4038808a')], categorySlug: 'croissants-pastries', isFeatured: true, isAvailable: true, stock: 30, sku: null, tags: ['bestseller'] },
    { name: 'Almond Croissant', slug: 'almond-croissant', description: 'Twice-baked croissant filled with almond cream and topped with toasted almonds.', price: 600, compareAtPrice: null, images: [img('photo-1623334044303-241021148842')], categorySlug: 'croissants-pastries', isFeatured: true, isAvailable: true, stock: 30, sku: null, tags: [] },
    { name: 'Pistachio Croissant', slug: 'pistachio-croissant', description: 'Filled with house pistachio cream and dusted with crushed pistachios - our most-loved bake.', price: 650, compareAtPrice: null, images: [img('photo-1623334044303-241021148842')], categorySlug: 'croissants-pastries', isFeatured: true, isAvailable: true, stock: 30, sku: null, tags: ['signature', 'bestseller'] },
    { name: 'Pain au Chocolat', slug: 'pain-au-chocolat', description: 'Buttery laminated pastry wrapped around dark chocolate batons.', price: 500, compareAtPrice: null, images: [img('photo-1555507036-ab1f4038808a')], categorySlug: 'croissants-pastries', isFeatured: false, isAvailable: true, stock: 30, sku: null, tags: [] },
    { name: 'Cinnamon Roll', slug: 'cinnamon-roll', description: 'Soft brioche swirl with cinnamon sugar and cream cheese glaze.', price: 550, compareAtPrice: null, images: [img('photo-1509365465985-25d11c17e812')], categorySlug: 'croissants-pastries', isFeatured: false, isAvailable: true, stock: 30, sku: null, tags: [] },
    { name: 'Danish Pastry', slug: 'danish-pastry', description: 'Flaky pastry filled with seasonal fruit compote and vanilla custard.', price: 520, compareAtPrice: null, images: [img('photo-1509440159596-0249088772ff')], categorySlug: 'croissants-pastries', isFeatured: false, isAvailable: true, stock: 30, sku: null, tags: [] },
    { name: 'VBC Chocolate Ganache', slug: 'vbcc-chocolate-ganache', description: 'Layers of chocolate sponge, dark ganache and vintage-style buttercream piping.', price: 6990, compareAtPrice: null, images: [img('photo-1565958011703-44f9829ba187')], categorySlug: 'signature-cakes', isFeatured: true, isAvailable: true, stock: 10, sku: null, tags: ['signature', 'whole-cake'] },
    { name: 'VBC Victorian Sponge', slug: 'vbcc-victorian-sponge', description: 'Classic vanilla sponge with raspberry jam and silky buttercream, finished in delicate vintage piping.', price: 6990, compareAtPrice: null, images: [img('photo-1535141192574-5d4897c12636')], categorySlug: 'signature-cakes', isFeatured: true, isAvailable: true, stock: 10, sku: null, tags: ['signature', 'whole-cake'] },
    { name: 'Pistachio Rose Cake Slice', slug: 'pistachio-rose-slice', description: 'Pistachio sponge, rose cream and a delicate pistachio crumb - by the slice.', price: 950, compareAtPrice: null, images: [img('photo-1488477181946-6428a0291777')], categorySlug: 'signature-cakes', isFeatured: true, isAvailable: true, stock: 20, sku: null, tags: ['signature'] },
    { name: 'Classic Tiramisu', slug: 'classic-tiramisu', description: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa.', price: 850, compareAtPrice: null, images: [img('photo-1571877227200-a0d98ea607e9')], categorySlug: 'signature-cakes', isFeatured: true, isAvailable: true, stock: 20, sku: null, tags: ['bestseller'] },
    { name: 'Classic Cheesecake Slice', slug: 'classic-cheesecake', description: 'Baked New York-style cheesecake on a buttery biscuit base.', price: 900, compareAtPrice: null, images: [img('photo-1567171466295-4afa63d45416')], categorySlug: 'signature-cakes', isFeatured: false, isAvailable: true, stock: 20, sku: null, tags: [] },
    { name: 'Red Velvet Slice', slug: 'red-velvet-slice', description: 'Cocoa-rich red velvet sponge with cream cheese frosting.', price: 850, compareAtPrice: null, images: [img('photo-1586985289688-ca3cf47d3e6e')], categorySlug: 'signature-cakes', isFeatured: false, isAvailable: true, stock: 20, sku: null, tags: [] },
    { name: 'Classic Sourdough Loaf', slug: 'classic-sourdough', description: '48-hour fermented sourdough with a deep golden crust - our most-loved loaf in DHA.', price: 1100, compareAtPrice: null, images: [img('photo-1549931319-a545d471dad4')], categorySlug: 'artisan-bread', isFeatured: true, isAvailable: true, stock: 15, sku: null, tags: ['bestseller'] },
    { name: 'Focaccia', slug: 'focaccia', description: 'Olive-oil rich focaccia topped with rosemary and sea salt.', price: 850, compareAtPrice: null, images: [img('photo-1589367920969-ab8e050bbb04')], categorySlug: 'artisan-bread', isFeatured: false, isAvailable: true, stock: 15, sku: null, tags: [] },
    { name: 'Multigrain Loaf', slug: 'multigrain-loaf', description: 'Hearty multigrain bread loaded with seeds and whole grains.', price: 1000, compareAtPrice: null, images: [img('photo-1586444248902-2f64eddc13df')], categorySlug: 'artisan-bread', isFeatured: false, isAvailable: true, stock: 15, sku: null, tags: [] },
    { name: 'Garlic Baguette', slug: 'garlic-baguette', description: 'Crisp baguette brushed with garlic butter and herbs.', price: 650, compareAtPrice: null, images: [img('photo-1608198093002-ad4e005484ec')], categorySlug: 'artisan-bread', isFeatured: false, isAvailable: true, stock: 20, sku: null, tags: [] },
    { name: 'Pink Pistachio Breakfast', slug: 'pink-pistachio-breakfast', description: 'Two eggs your way, grilled tomato, hash browns, sauteed mushrooms, baked beans and toasted sourdough.', price: 1450, compareAtPrice: null, images: [img('photo-1482049016688-2d3e1b311543')], categorySlug: 'all-day-brunch', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['signature'] },
    { name: 'Avocado Toast', slug: 'avocado-toast', description: 'Smashed avocado on sourdough with chili flakes, lemon and a poached egg.', price: 1100, compareAtPrice: null, images: [img('photo-1525351484163-7529414344d8')], categorySlug: 'all-day-brunch', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['bestseller'] },
    { name: 'Shakshuka', slug: 'shakshuka', description: 'Eggs poached in a spiced tomato and pepper sauce, served with toasted bread.', price: 1250, compareAtPrice: null, images: [img('photo-1590412200988-a436970781fa')], categorySlug: 'all-day-brunch', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'French Toast', slug: 'french-toast', description: 'Brioche French toast with seasonal berries, mascarpone and maple syrup.', price: 1150, compareAtPrice: null, images: [img('photo-1484723091739-30a097e8f929')], categorySlug: 'all-day-brunch', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Belgian Waffles', slug: 'belgian-waffles', description: 'Crisp waffles with whipped cream, berries and pistachio crumble.', price: 1200, compareAtPrice: null, images: [img('photo-1562376552733-04b8f1f8b3c8')], categorySlug: 'all-day-brunch', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Salted Beef Baguette', slug: 'salted-beef-baguette', description: 'Slow-cooked salted beef, pickles and mustard mayo in a crisp baguette.', price: 1450, compareAtPrice: null, images: [img('photo-1481833761820-0509d3217039')], categorySlug: 'sandwiches-baguettes', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['signature', 'bestseller'] },
    { name: 'Grilled Chicken and Brie', slug: 'grilled-chicken-brie', description: 'Grilled chicken breast, melted brie, rocket and cranberry on sourdough.', price: 1350, compareAtPrice: null, images: [img('photo-1539252554935-80c7c0d49bdd')], categorySlug: 'sandwiches-baguettes', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Caprese Panini', slug: 'caprese-panini', description: 'Fresh mozzarella, tomato, basil and balsamic glaze, pressed in focaccia.', price: 1200, compareAtPrice: null, images: [img('photo-1521305916504-4a1121188589')], categorySlug: 'sandwiches-baguettes', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Smoked Salmon Bagel', slug: 'smoked-salmon-bagel', description: 'Toasted bagel with cream cheese, smoked salmon, capers and dill.', price: 1550, compareAtPrice: null, images: [img('photo-1592961630841-9c0a5a4a9e25')], categorySlug: 'sandwiches-baguettes', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Watermelon Feta Salad', slug: 'watermelon-feta', description: 'Watermelon cubes, feta cheese and mint leaves with a balsamic glaze.', price: 1250, compareAtPrice: null, images: [img('photo-1551782450-a2132b4ba21d')], categorySlug: 'seasonal-salads', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: ['seasonal'] },
    { name: 'Zesty Mango Salad', slug: 'zesty-mango', description: 'Mango slices, cilantro, red chillies and carrots with a chilli-lime vinaigrette.', price: 1350, compareAtPrice: null, images: [img('photo-1564093497595-593b96d80180')], categorySlug: 'seasonal-salads', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: ['seasonal'] },
    { name: 'Grilled Peach Salad', slug: 'grilled-peach-salad', description: 'Mixed greens, grilled peaches, feta crumbs and candied walnuts with maple balsamic.', price: 1400, compareAtPrice: null, images: [img('photo-1505575967455-40e256f73376')], categorySlug: 'seasonal-salads', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['seasonal', 'signature'] },
    { name: 'Classic Caesar Salad', slug: 'classic-caesar', description: 'Romaine, grilled chicken, parmesan and house Caesar dressing with croutons.', price: 1300, compareAtPrice: null, images: [img('photo-1550304943-4f24f54ddde9')], categorySlug: 'seasonal-salads', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Mushroom Puff', slug: 'mushroom-puff', description: 'Flaky pastry parcel filled with creamy garlic mushrooms.', price: 480, compareAtPrice: null, images: [img('photo-1621996346565-e3dbc646d9a9')], categorySlug: 'savoury-bites', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Cheese Sticks', slug: 'cheese-sticks', description: 'Golden baked breadsticks stuffed with melted mozzarella, served with marinara.', price: 650, compareAtPrice: null, images: [img('photo-1619531040576-f9416740661b')], categorySlug: 'savoury-bites', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Loaded Fries', slug: 'loaded-fries', description: 'Crispy fries loaded with cheese sauce, jalapenos and herbs.', price: 850, compareAtPrice: null, images: [img('photo-1573080496219-bb080dd4f877')], categorySlug: 'savoury-bites', isFeatured: true, isAvailable: true, stock: 50, sku: null, tags: ['bestseller'] },
    { name: 'Chicken Croquettes', slug: 'chicken-croquettes', description: 'Crisp-fried croquettes with creamy chicken filling, served with garlic aioli.', price: 750, compareAtPrice: null, images: [img('photo-1626645738196-c2a7c87a8489')], categorySlug: 'savoury-bites', isFeatured: false, isAvailable: true, stock: 50, sku: null, tags: [] },
    { name: 'Pink Velvet Cupcake', slug: 'pink-velvet-cupcake', description: 'Soft velvet cupcake topped with a swirl of rose buttercream.', price: 380, compareAtPrice: null, images: [img('photo-1607478900766-efe13248b125')], categorySlug: 'cupcakes-cookies', isFeatured: true, isAvailable: true, stock: 40, sku: null, tags: ['signature'] },
    { name: 'Pistachio Macaron Box of 6', slug: 'pistachio-macaron-box', description: 'Six delicate pistachio macarons with white chocolate ganache filling.', price: 1800, compareAtPrice: null, images: [img('photo-1569864358642-9d1684040f43')], categorySlug: 'cupcakes-cookies', isFeatured: true, isAvailable: true, stock: 20, sku: null, tags: ['signature', 'gift'] },
    { name: 'Chocolate Chip Cookie', slug: 'chocolate-chip-cookie', description: 'Thick, gooey cookie loaded with dark chocolate chunks.', price: 350, compareAtPrice: null, images: [img('photo-1499636136210-6f4ee915583e')], categorySlug: 'cupcakes-cookies', isFeatured: false, isAvailable: true, stock: 40, sku: null, tags: [] },
    { name: 'Lotus Biscoff Cupcake', slug: 'lotus-biscoff-cupcake', description: 'Vanilla cupcake topped with Biscoff buttercream and crumb.', price: 420, compareAtPrice: null, images: [img('photo-1614707267537-b85aaf00c4b7')], categorySlug: 'cupcakes-cookies', isFeatured: false, isAvailable: true, stock: 40, sku: null, tags: [] },
  ];

  for (const p of productsData) {
    const { categorySlug, ...rest } = p;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...rest, categoryId: categories[categorySlug] },
      create: { ...rest, categoryId: categories[categorySlug] },
    });
  }

  await prisma.banner.deleteMany({});

  const bannerData = [
    { type: BannerType.HERO, title: 'Pink Pistachio', subtitle: 'Boutique Cafe & Patisserie - DHA Raya & Gulberg, Lahore', image: img('photo-1554118811-1e0d58224f24'), position: 1, isActive: true },
    { type: BannerType.HERO, title: 'Baked Fresh, Every Morning', subtitle: 'Sourdough, croissants & vintage cakes - straight from our kitchen', image: img('photo-1517433367423-c7e5b0f35086'), position: 2, isActive: true },
    { type: BannerType.PROMO, title: 'Free Delivery Over Rs. 3,000', subtitle: 'Across DHA & Gulberg, Lahore', image: img('photo-1577219491135-ce391730fb2c'), position: 1, isActive: true },
    { type: BannerType.GALLERY, title: 'Our Pistachio Latte', subtitle: null, image: img('photo-1517701604599-bb29b565090c'), position: 1, isActive: true },
    { type: BannerType.GALLERY, title: 'Vintage Butter Cream Cakes', subtitle: null, image: img('photo-1535141192574-5d4897c12636'), position: 2, isActive: true },
    { type: BannerType.GALLERY, title: 'European Interiors', subtitle: null, image: img('photo-1554118811-1e0d58224f24'), position: 3, isActive: true },
    { type: BannerType.GALLERY, title: 'Fresh Pastry Counter', subtitle: null, image: img('photo-1555507036-ab1f4038808a'), position: 4, isActive: true },
  ];

  for (const b of bannerData) {
    await prisma.banner.create({ data: b });
  }

  await prisma.coupon.upsert({
    where: { code: 'PISTACHIO10' },
    update: {},
    create: { code: 'PISTACHIO10', type: CouponType.PERCENTAGE, value: 10, minOrderAmount: 1500, isActive: true },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME150' },
    update: {},
    create: { code: 'WELCOME150', type: CouponType.FIXED, value: 150, minOrderAmount: 1000, isActive: true },
  });

  console.log('Seed complete.');
  console.log('Admin -> email: ' + adminEmail + ' / password: ' + adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });