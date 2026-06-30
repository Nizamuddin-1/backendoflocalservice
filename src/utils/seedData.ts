import {
  ServiceCategory,
  Service,
  ServiceVariation,
  Promo,
  Offer,
} from '../models';
import { AppError } from '../middleware/errorHandler';

export async function seedDatabase(): Promise<void> {
  try {
    const catCount = await ServiceCategory.countDocuments();
    if (catCount > 0) {
      console.log('[Seed] Database already seeded, skipping.');
      return;
    }

    console.log('[Seed] Seeding database...');

    const categories = await ServiceCategory.insertMany([
      { name: 'AC & Cooling', icon: 'snow', color: '#1B4FD8', bg: '#E9EFFC', proCount: 22 },
      { name: 'Plumbing', icon: 'water', color: '#3D7A60', bg: '#E6F4EC', proCount: 17 },
      { name: 'Electrical', icon: 'flash', color: '#B07D2E', bg: '#FBF0D6', proCount: 31 },
      { name: 'Cleaning', icon: 'sparkles', color: '#6B3FA0', bg: '#F0EAFA', proCount: 14 },
      { name: 'Painting', icon: 'color-palette', color: '#C0522B', bg: '#FDF1EC', proCount: 9 },
      { name: 'Carpentry', icon: 'hammer', color: '#A83E20', bg: '#FAEAE4', proCount: 11 },
      { name: 'Pest Control', icon: 'shield-checkmark', color: '#0D9488', bg: '#CCFBF1', proCount: 8 },
      { name: 'Salon', icon: 'cut', color: '#6B3FA0', bg: '#F0EAFA', proCount: 13 },
    ]);

    const catMap = new Map(categories.map((c) => [c.name, c._id]));

    const acCat = catMap.get('AC & Cooling');
    const plumbingCat = catMap.get('Plumbing');
    const electricalCat = catMap.get('Electrical');
    const cleaningCat = catMap.get('Cleaning');
    const paintingCat = catMap.get('Painting');
    const carpentryCat = catMap.get('Carpentry');
    const pestCat = catMap.get('Pest Control');
    const salonCat = catMap.get('Salon');

    const services = await Service.insertMany([
      {
        categoryId: acCat!, name: 'AC Deep Service & Gas Refill',
        provider: 'Agra Air Solutions', providerInitials: 'AA',
        categoryLabel: 'AC & Cooling', mcIcon: 'air-conditioner',
        rating: 4.7, reviews: 1234, price: 599, originalPrice: 799,
        badge: 'MOST BOOKED', tags: ['Same-day', '2-yr Warranty', 'Certified'],
        eta: '~15 min', verified: true, accentColor: '#1B4FD8', accentBg: '#E9EFFC',
        jobCount: 3840, shortDesc: 'Full gas top-up, coil cleaning & deep maintenance.',
      },
      {
        categoryId: plumbingCat!, name: 'Home Plumbing Inspection & Repair',
        provider: 'Apex Plumbing Services', providerInitials: 'AP',
        categoryLabel: 'Plumbing', mcIcon: 'pipe-wrench',
        rating: 4.5, reviews: 892, price: 399,
        badge: 'EDITOR PICK', tags: ['Emergency', 'Licensed', '24/7'],
        eta: '~20 min', verified: true, accentColor: '#3D7A60', accentBg: '#E6F4EC',
        jobCount: 2210, shortDesc: 'Comprehensive leak detection and pipe repair.',
      },
      {
        categoryId: electricalCat!, name: 'Wiring & MCB Panel Replacement',
        provider: 'SparkFix Electricals', providerInitials: 'SF',
        categoryLabel: 'Electrical', mcIcon: 'lightning-bolt',
        rating: 4.8, reviews: 2103, price: 299, originalPrice: 399,
        badge: 'FLASH DEAL', tags: ['ISI Certified', 'Insured', 'Safe'],
        eta: '~10 min', verified: true, accentColor: '#B07D2E', accentBg: '#FBF0D6',
        jobCount: 5620, shortDesc: 'Safe rewiring, MCB upgrades and hazard diagnostics.',
      },
      {
        categoryId: cleaningCat!, name: 'Deep Home Cleaning — 2BHK',
        provider: 'CleanPro Home Care', providerInitials: 'CP',
        categoryLabel: 'Cleaning', mcIcon: 'spray-bottle',
        rating: 4.3, reviews: 567, price: 799,
        badge: 'NEW LAUNCH', tags: ['Eco Products', 'Trained Staff', 'Insured'],
        eta: '~30 min', verified: false, accentColor: '#6B3FA0', accentBg: '#F0EAFA',
        jobCount: 980, shortDesc: 'Floor-to-ceiling deep clean using eco-safe products.',
      },
      {
        categoryId: paintingCat!, name: 'Interior Wall Painting — Per Room',
        provider: 'PaintMaster Pro', providerInitials: 'PM',
        categoryLabel: 'Painting', mcIcon: 'format-paint',
        rating: 4.6, reviews: 445, price: 1499, originalPrice: 1999,
        badge: 'PREMIUM', tags: ['Free Estimate', 'Premium Paint', '3-yr Warranty'],
        eta: '~45 min', verified: true, accentColor: '#C0522B', accentBg: '#FDF1EC',
        jobCount: 1340, shortDesc: 'Premium interior painting with top-brand paints.',
      },
      {
        categoryId: carpentryCat!, name: 'Custom Furniture & Woodwork',
        provider: 'WoodCraft Carpentry', providerInitials: 'WC',
        categoryLabel: 'Carpentry', mcIcon: 'saw-blade',
        rating: 4.4, reviews: 310, price: 999,
        tags: ['Custom Work', 'Teak Wood', 'Warranty'],
        eta: '~60 min', verified: true, accentColor: '#A83E20', accentBg: '#FAEAE4',
        jobCount: 760, shortDesc: 'Bespoke furniture design and solid wood repairs.',
      },
      {
        categoryId: pestCat!, name: 'Pest Control & Extermination',
        provider: 'SafeShield Pest Control', providerInitials: 'SS',
        categoryLabel: 'Pest Control', mcIcon: 'shield-bug',
        rating: 4.5, reviews: 678, price: 449, originalPrice: 599,
        badge: 'MOST BOOKED', tags: ['Child-Safe', 'Odorless', 'Re-treatment Guarantee'],
        eta: '~25 min', verified: true, accentColor: '#3D7A60', accentBg: '#E6F4EC',
        jobCount: 2140, shortDesc: 'Targeted extermination for cockroaches, termites and more.',
      },
      {
        categoryId: salonCat!, name: 'Full Salon At-Home Package',
        provider: 'GlamTouch Beauty Studio', providerInitials: 'GT',
        categoryLabel: 'Salon', mcIcon: 'content-cut',
        rating: 4.6, reviews: 823, price: 699, originalPrice: 999,
        badge: 'NEW LAUNCH', tags: ['Unisex', 'Premium Products', 'Doorstep'],
        eta: '~35 min', verified: true, accentColor: '#6B3FA0', accentBg: '#F0EAFA',
        jobCount: 1560, shortDesc: 'Professional salon experience at home.',
      },
    ]);

    const variationsData = [
      { serviceIdx: 0, items: [
        { label: 'Basic Service', desc: 'Filter clean + visual check', price: 299, mcIcon: 'air-conditioner', duration: '45 min' },
        { label: 'Deep Service', desc: 'Coil clean, drainage, full tune-up', price: 599, originalPrice: 799, popular: true, mcIcon: 'air-conditioner', duration: '90 min' },
        { label: 'Gas Refill Only', desc: 'Refrigerant top-up (R-22 / R-32)', price: 850, mcIcon: 'gas-cylinder', duration: '30 min' },
        { label: 'Service + Gas Refill', desc: 'Complete deep service with gas top-up', price: 1299, originalPrice: 1599, mcIcon: 'air-conditioner', duration: '2 hrs' },
        { label: 'PCB / Capacitor Fix', desc: 'Electronic component diagnosis & repair', price: 350, mcIcon: 'chip', duration: '60 min' },
      ]},
      { serviceIdx: 1, items: [
        { label: 'Health Inspection', desc: 'Full pipe & tap health check', price: 199, mcIcon: 'pipe', duration: '30 min' },
        { label: 'Leakage Repair', desc: 'Fix leaking joints, pipes or taps', price: 399, popular: true, mcIcon: 'pipe-wrench', duration: '60 min' },
        { label: 'Tap Replacement', desc: 'Replace one tap / faucet (part extra)', price: 249, mcIcon: 'water-pump', duration: '30 min' },
        { label: 'Blocked Drain Clear', desc: 'High-pressure drain unclogging', price: 499, mcIcon: 'water', duration: '45 min' },
        { label: 'Full Bathroom Fix', desc: 'Taps, shower, drain & commode check', price: 899, originalPrice: 1099, mcIcon: 'shower', duration: '2 hrs' },
      ]},
      { serviceIdx: 2, items: [
        { label: 'Basic Inspection', desc: 'Safety check + fault report', price: 149, mcIcon: 'flash-outline', duration: '30 min' },
        { label: 'Switch / Socket Fix', desc: 'Repair or replace up to 3 switches', price: 299, popular: true, originalPrice: 399, mcIcon: 'power-plug', duration: '45 min' },
        { label: 'MCB Replacement', desc: 'Single MCB swap with ISI parts', price: 450, mcIcon: 'electric-switch', duration: '60 min' },
        { label: 'Full Panel Upgrade', desc: 'Complete distribution board replacement', price: 1800, originalPrice: 2200, mcIcon: 'home-lightning-bolt', duration: '3 hrs' },
        { label: 'Ceiling Fan Wiring', desc: 'Install / rewire one ceiling fan', price: 199, mcIcon: 'fan', duration: '30 min' },
      ]},
    ];

    for (const vg of variationsData) {
      const service = services[vg.serviceIdx];
      await ServiceVariation.insertMany(
        vg.items.map((item) => ({ ...item, serviceId: service._id }))
      );
    }

    await Promo.insertMany([
      { tag: 'LIMITED TIME', headline: 'Flat ₹150 Off', body: 'On your first AC or Electrical booking. Use code at checkout.', cta: 'Grab Deal', accent: '#3B6FE8', darkBg: '#0B1829', mcIcon: 'lightning-bolt' },
      { tag: 'WALLET OFFER', headline: '10% Cashback', body: 'Add ₹1,000 or more to your wallet and earn instant cashback.', cta: 'Add Money', accent: '#3D7A60', darkBg: '#0E1F18', mcIcon: 'wallet-plus-outline' },
      { tag: 'NEW USER', headline: 'Free Inspection', body: 'Book any Plumbing service and get a complimentary health checkup.', cta: 'Book Now', accent: '#C0522B', darkBg: '#1F0F09', mcIcon: 'wrench-outline' },
    ]);

    await Offer.insertMany([
      { title: 'Flat ₹150 Off', subtitle: 'On your next AC or Electrical booking', discount: '₹150', code: 'LOCALFIX150', expiry: 'Expires 31 Mar', color: '#2563EB', icon: 'lightning-bolt' },
      { title: '10% Cashback', subtitle: 'Add ₹1000+ to wallet & get cashback', discount: '10%', code: 'WALLET10', expiry: 'Expires 20 Mar', color: '#10B981', icon: 'wallet-outline' },
      { title: 'Free Inspection', subtitle: 'On first Plumbing or Carpentry booking', discount: 'FREE', code: 'FIRSTFIX', expiry: 'Limited period', color: '#7C3AED', icon: 'wrench-outline' },
    ]);

    console.log('[Seed] Database seeded successfully.');
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to seed database', 500);
  }
}
