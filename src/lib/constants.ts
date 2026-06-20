export const SITE = {
  name: 'Pink Pistachio',
  legalName: 'Pink Pistachio Café & Patisserie',
  tagline: 'Boutique Café & Patisserie',
  description:
    'Pink Pistachio is a boutique café and patisserie in Lahore serving specialty coffee, vintage butter cream cakes, artisan bread, croissants and an all-day brunch menu — with branches in DHA Raya and Gulberg.',
  // Use the live Vercel URL until custom domain pinkpistachio.pk is active
  url: 'https://pink-pistachio-website-6inh.vercel.app',
};

export const BRANCHES = [
  {
    id: 'dha-raya',
    name: 'DHA Raya',
    address: 'Building 103, Raya Fairways, Phase 6 DHA, Lahore',
    hours: '9:00 AM – 12:00 AM',
    phone: '+92 300 1234567',
    mapUrl: 'https://maps.google.com/?q=Raya+Fairways+DHA+Phase+6+Lahore',
  },
  {
    id: 'gulberg',
    name: 'Gulberg',
    address: 'Mall 94, Block D1, Gulberg, Lahore',
    hours: '9:00 AM – 2:00 AM',
    phone: '+92 300 7654321',
    mapUrl: 'https://maps.google.com/?q=Mall+94+Block+D1+Gulberg+Lahore',
  },
];

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];