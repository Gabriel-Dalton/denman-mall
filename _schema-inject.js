#!/usr/bin/env node
/**
 * Injects JSON-LD schema into <head> of each HTML page. Idempotent via
 * <!--SCHEMA:start--> / <!--SCHEMA:end--> markers. Run: node _schema-inject.js
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://denmanmall.com';
const MALL_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '1030 Denman St',
  addressLocality: 'Vancouver',
  addressRegion: 'BC',
  postalCode: 'V6G 2M6',
  addressCountry: 'CA',
};
const MALL_HOURS = [{
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  opens: '08:00',
  closes: '22:00',
}];
const MALL = {
  '@type': 'ShoppingCenter',
  '@id': `${SITE}/#mall`,
  name: 'Denman Place Mall',
  url: `${SITE}/`,
  image: `${SITE}/assets/images/open-graph.webp`,
  logo: `${SITE}/assets/images/denman-mall-logo.webp`,
  telephone: '+1-604-685-1466',
  address: MALL_ADDRESS,
  openingHoursSpecification: MALL_HOURS,
  sameAs: [
    'https://www.facebook.com/thedenmanplacemall',
    'https://www.instagram.com/thedenmanmall/',
    'https://www.linkedin.com/company/denmanplacemall',
    'https://x.com/thedenmanmall',
  ],
};

// LocalBusiness stores: file → metadata
const STORES = {
  '93-coffee.html':            { name: '93 Coffee', type: 'CafeOrCoffeeShop', image: 'assets/images/93-coffee.webp', sameAs: ['https://www.93coffee.ca/'] },
  'accountax.html':            { name: 'Accountax Financial', type: 'AccountingService', image: 'assets/images/accountax.webp', tel: '+1-604-684-6474', sameAs: ['https://www.myaccountax.ca/'] },
  'bclc-lotto.html':           { name: 'BCLC Lotto', type: 'Store', image: 'assets/images/lotto.avif', sameAs: ['https://www.playnow.com/lottery/lotto-649/'] },
  'burger-king.html':          { name: 'Burger King', type: 'FastFoodRestaurant', image: 'assets/images/burger-king.webp', sameAs: ['https://www.burgerking.ca/'] },
  'canada-post.html':          { name: 'Canada Post Outlet', type: 'PostalService', image: 'assets/images/canada-post.webp', sameAs: ['https://www.canadapost-postescanada.ca/'] },
  'clothes-collectibles.html': { name: 'Clothes & Collectables (WESN)', type: 'ClothingStore', image: 'assets/images/wesn.webp', sameAs: ['https://wesn.ca/clothes-collectibles/'] },
  'denman-chiropractic.html':  { name: 'Denman Chiropractic & Massage', type: 'Chiropractor', image: 'assets/images/denman-chiropractic.webp', tel: '+1-604-646-4645', sameAs: ['https://www.vancouver-chiropractor.com/'] },
  'denman-liquor-store.html':  { name: 'Denman Beer Wine & Spirits', type: 'LiquorStore', image: 'assets/images/denman-liquor.avif', tel: '+1-604-633-1863', sameAs: ['https://glacierliquor.ca/pages/denman-beer-wine-spirits'] },
  'denman-place-dental.html':  { name: 'Denman Place Dental Centre', type: 'Dentist', image: 'assets/images/denman-dental-centre.webp', tel: '+1-604-688-3335', sameAs: ['https://www.denmandental.com/'] },
  'devak-key-lock.html':       { name: 'Devak Lock & Key', type: 'Locksmith', image: 'assets/images/devak.webp', tel: '+1-604-669-6947', sameAs: ['https://www.devaklock.ca/'] },
  'dollarama.html':            { name: 'Dollarama', type: 'Store', image: 'assets/images/dollarama.webp', sameAs: ['https://www.dollarama.com/'] },
  'english-bay-jewellers.html':{ name: 'English Bay Jewellers', type: 'JewelryStore', image: 'assets/images/english-bay-jewellers.webp', tel: '+1-604-633-0688' },
  'hedy-fry.html':             { name: 'MP Hedy Fry Vancouver Centre', type: 'GovernmentOffice', image: 'assets/images/hedy-fry.webp', tel: '+1-604-666-0135', sameAs: ['https://www.hedyfry.com'] },
  'lost-lagoon-frames.html':   { name: 'Lost Lagoon Frames', type: 'Store', image: 'assets/images/lost-lagoon-frames.webp', sameAs: ['https://www.lostlagoon.ca/'] },
  'minit-foto.html':           { name: 'Minit Foto', type: 'Store', image: 'assets/images/minit-foto-directory.webp', tel: '+1-604-684-9867' },
  'murrick-insurance.html':    { name: 'Murrick Insurance', type: 'InsuranceAgency', image: 'assets/images/murrick.webp', tel: '+1-604-681-5454', sameAs: ['https://www.murrick.com/locations/murrick-west-end/'] },
  'no-frills.html':            { name: "Brandon & Joanny's No Frills", type: 'GroceryStore', image: 'assets/images/no-frills.webp', sameAs: ['https://www.nofrills.ca/'] },
  'open-door-law.html':        { name: 'Open Door Law', type: 'LegalService', image: 'assets/images/open-door-law.webp', tel: '+1-604-689-3667', sameAs: ['https://opendoorlaw.com'] },
  'rose-stitching.html':       { name: 'Rose Stitching & Healing', type: 'HealthAndBeautyBusiness', image: 'assets/images/rose-healing.webp', tel: '+1-604-418-7109', sameAs: ['https://rose-healing.com'] },
  'scissors-comb-barbershop.html': { name: 'Scissors & Comb Barbers', type: 'BarberShop', image: 'assets/images/scissors-and-comb.webp', tel: '+1-778-379-2248' },
  'shoppers-drug-mart.html':   { name: 'Shoppers Drug Mart', type: 'Pharmacy', image: 'assets/images/shoppers.webp', sameAs: ['https://www.shoppersdrugmart.ca/'] },
  'specsavers.html':           { name: 'Specsavers', type: 'Optician', image: 'assets/images/specsavers.webp', sameAs: ['https://www.specsavers.ca/'] },
  'stanley-park-dental.html':  { name: 'Stanley Park Dental Centre', type: 'Dentist', image: 'assets/images/stanley-park-dental-centre-directory.webp', tel: '+1-604-662-3333', sameAs: ['https://stanleyparkdentist.com'] },
  'teate-clinic.html':         { name: 'TE.A.TE Clinic', type: 'MedicalClinic', image: 'assets/images/teate-clinic.webp', sameAs: ['https://teateclinic.com/'] },
  'the-ice-cream-parlour.html':{ name: 'The Ice Cream Parlour (Eyewear)', type: 'Store', image: 'assets/images/the-ice-cream-parlour.webp', sameAs: ['https://theicecreamparlour.ca/'] },
  'ups.html':                  { name: 'The UPS Store', type: 'PostalService', image: 'assets/images/ups.webp', sameAs: ['https://www.theupsstore.ca/42/'] },
  'wesn.html':                 { name: "Key's Place (WESN)", type: 'LocalBusiness', image: 'assets/images/wesn.webp', sameAs: ['https://wesn.ca/kays-place/'] },
  'yvr-travel.html':           { name: 'YVR Travel Service', type: 'TravelAgency', image: 'assets/images/yvr-travel-directory.webp', tel: '+1-604-687-1541', sameAs: ['https://yvrtravel.com'] },
};

// Non-store pages: slug → schema type override
const PAGE_TYPES = {
  'index.html':         'home',
  'directory.html':     'directory',
  'about.html':         { '@type': 'AboutPage', name: 'About Denman Place Mall' },
  'contact.html':       { '@type': 'ContactPage', name: 'Contact Denman Place Mall' },
  'events.html':        { '@type': 'CollectionPage', name: 'Events at Denman Place Mall' },
  'events-1.html':      { '@type': 'CollectionPage', name: 'Events at Denman Place Mall' },
  'event-example.html': { '@type': 'Event', name: 'Example Event' },
  'halloween.html':     { '@type': 'Event', name: 'Halloween at Denman Place Mall' },
  'terms.html':         { '@type': 'WebPage', name: 'Terms of Use' },
  'privacy-policy.html':{ '@type': 'WebPage', name: 'Privacy Policy' },
  'accessibility.html': { '@type': 'WebPage', name: 'Accessibility' },
  'safety-updates.html':{ '@type': 'WebPage', name: 'Safety & Emergency Information' },
  '404.html':           { '@type': 'WebPage', name: 'Page Not Found' },
  'update-in-progress.html': { '@type': 'WebPage', name: 'Update in Progress' },
  'global-scripts.html': null,
};

function canonicalFor(file) {
  // Matches the slug pattern used in existing canonicals (no .html, no trailing slash except special cases).
  const slug = file.replace(/\.html$/, '');
  if (slug === 'index') return `${SITE}/`;
  return `${SITE}/${slug}`;
}

function storeSchema(file, meta) {
  const url = canonicalFor(file);
  const node = {
    '@context': 'https://schema.org',
    '@type': meta.type,
    '@id': `${url}#business`,
    name: meta.name,
    url,
    image: `${SITE}/${meta.image}`,
    address: MALL_ADDRESS,
    containedInPlace: { '@id': `${SITE}/#mall` },
    parentOrganization: { '@id': `${SITE}/#mall` },
  };
  if (meta.tel) node.telephone = meta.tel;
  if (meta.sameAs) node.sameAs = meta.sameAs;
  return [MALL, node];
}

function pageSchema(file, override) {
  const url = canonicalFor(file);
  return [MALL, {
    '@context': 'https://schema.org',
    ...override,
    url,
    isPartOf: { '@id': `${SITE}/#mall` },
  }];
}

function homeSchema() {
  return [{
    ...MALL,
    '@context': 'https://schema.org',
    description: 'Denman Place Mall is a community shopping centre in Vancouver\'s West End, home to 30+ shops and services.',
  }];
}

function directorySchema() {
  const items = Object.entries(STORES).map(([file, meta], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: canonicalFor(file),
    name: meta.name,
  }));
  return [MALL, {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Stores & Services at Denman Place Mall',
    url: `${SITE}/directory`,
    numberOfItems: items.length,
    itemListElement: items,
  }];
}

function buildSchema(file) {
  if (STORES[file]) return storeSchema(file, STORES[file]);
  if (file in PAGE_TYPES) {
    const v = PAGE_TYPES[file];
    if (v === null) return null;
    if (v === 'home') return homeSchema();
    if (v === 'directory') return directorySchema();
    return pageSchema(file, v);
  }
  // Unknown — basic WebPage fallback
  return pageSchema(file, { '@type': 'WebPage' });
}

function renderBlock(nodes) {
  const json = JSON.stringify(nodes.length === 1 ? nodes[0] : { '@context':'https://schema.org', '@graph': nodes }, null, 2);
  return `<!--SCHEMA:start-->\n<script type="application/ld+json">\n${json}\n</script>\n<!--SCHEMA:end-->`;
}

function inject(html, block) {
  const re = /<!--SCHEMA:start-->[\s\S]*?<!--SCHEMA:end-->\n?/;
  if (re.test(html)) return html.replace(re, block + '\n');
  // Insert before </head>
  return html.replace(/<\/head>/i, `${block}\n</head>`);
}

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
let updated = 0;
for (const f of files) {
  const nodes = buildSchema(f);
  if (!nodes) { console.log(`  skip       ${f}`); continue; }
  const fp = path.join(__dirname, f);
  const before = fs.readFileSync(fp, 'utf8');
  const after = inject(before, renderBlock(nodes));
  if (after !== before) { fs.writeFileSync(fp, after); updated++; console.log(`  updated    ${f}`); }
  else console.log(`  unchanged  ${f}`);
}
console.log(`\nDone. ${updated} updated.`);
