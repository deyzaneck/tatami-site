import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

function assetPath(src) {
  return path.join(DIST_DIR, decodeURIComponent(src).replace(/^\/?(?:tatami-site\/)?/, ''));
}

function readHtml() {
  assert.ok(fs.existsSync(INDEX_HTML_PATH), 'dist/index.html must exist after astro build');
  return fs.readFileSync(INDEX_HTML_PATH, 'utf8');
}

test('Built index.html has semantic structure, title, lang=ru, favicon, and no ViewTransitions router', () => {
  const html = readHtml();
  assert.match(html, /<html[^>]+lang="ru"/);
  assert.match(html, /<header[\s>]/);
  assert.match(html, /<main[^>]+id="main-content"/);
  assert.match(html, /<footer[\s>]/);
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'favicon.svg')), 'dist/favicon.svg must exist');
  assert.ok(!html.includes('astro-view-transitions'), 'Single-page site must not bundle ViewTransitions router');
});

test('Public conceptual images are copied & optimized into public/images and dist/images without Temp links', () => {
  const html = readHtml();
  const expectedImages = [
    '/images/hero-athlete.webp',
    '/images/direction-judo.webp',
    '/images/direction-muay-thai.webp',
    '/images/direction-gymnastics.webp',
  ];

  for (const rel of expectedImages) {
    const publicPath = path.join(ROOT, 'public', rel.replace(/^\//, ''));
    const distPath = path.join(DIST_DIR, rel.replace(/^\//, ''));
    assert.ok(fs.existsSync(publicPath), `Missing optimized image in public: ${publicPath}`);
    assert.ok(fs.existsSync(distPath), `Missing image in dist: ${distPath}`);
  }

  assert.ok(!html.includes('AppData'), 'HTML must not contain Temp path references');
  assert.ok(!html.includes('omp-image-'), 'HTML must not reference temporary image filenames');
});

test('All 11 documentary hall photos are in gallery (not conceptual images) and all assets exist in dist/', () => {
  const html = readHtml();
  const gallerySectionMatch = html.match(/<section id="gallery"[\s\S]*?<\/section>/);
  assert.ok(gallerySectionMatch, 'Gallery section must exist');
  const galleryHtml = gallerySectionMatch[0];

  const itemMatches = [...galleryHtml.matchAll(/data-gallery-item[\s\S]*?data-full-src="([^"]+)"/g)];
  assert.equal(itemMatches.length, 11, `Expected 11 gallery items, got ${itemMatches.length}`);

  for (const [, fullSrc] of itemMatches) {
    assert.ok(fullSrc.includes('/_astro/'), `Gallery must only use documentary hall assets, got: ${fullSrc}`);
    const filePath = assetPath(fullSrc);
    assert.ok(fs.existsSync(filePath), `Missing built lightbox asset: ${filePath}`);
  }

  // Ensure conceptual direction images are never placed inside the documentary hall gallery or trainers
  assert.ok(!galleryHtml.includes('/images/direction-'), 'Gallery must not contain conceptual illustrations');
  const trainersSectionMatch = html.match(/<section id="trainers"[\s\S]*?<\/section>/);
  assert.ok(trainersSectionMatch, 'Trainers section must exist');
  assert.ok(!trainersSectionMatch[0].includes('/images/'), 'Trainers must not use generated portraits');

  // Verify every <img> has alt and resolves on disk (except empty lightbox placeholder)
  const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  for (const tag of imgTags) {
    assert.match(tag, /\salt="/, `Image tag is missing alt attribute: ${tag}`);
    const srcMatch = tag.match(/\ssrc="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      const imgPath = assetPath(srcMatch[1]);
      assert.ok(fs.existsSync(imgPath), `Missing built image file: ${imgPath}`);
    }
  }
});

test('Booking offers only three directions without group selection or unconfirmed time slots', () => {
  const html = readHtml();
  const select = html.match(/<select[^>]+id="signup-direction"[^>]*>([\s\S]*?)<\/select>/)?.[1];
  assert.ok(select, 'Direction selector must exist');
  const options = [...select.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)]
    .map(([, value, label]) => [value, label]);
  assert.deepEqual(options, [['judo', 'Дзюдо'], ['muay-thai', 'Тайский бокс'], ['stretching', 'Стретчинг']]);
  const choices = [...html.matchAll(/data-select-direction="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(choices, options.map(([value]) => value), 'Every direction CTA must select its own direction');
  assert.ok(!html.includes('signup-group'), 'Booking must not ask clients to choose groups');
  assert.ok(!html.includes('data-schedule-card'), 'Group picking has moved to Telegram');
  const directions = html.match(/<section id="directions"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(!/акробат|гимнаст|джиу-джитсу/i.test(directions), 'Only current booking directions may be advertised');
});

test('All 8 real Yandex reviews appear without invented stars, overall ratings, or fake dates', () => {
  const html = readHtml();
  const reviewsSection = html.match(/<section id="reviews"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(reviewsSection.length > 0, 'Reviews section must exist');

  const slideMatches = [...reviewsSection.matchAll(/data-review-slide/g)];
  assert.equal(slideMatches.length, 8, `Expected 8 review slides, got ${slideMatches.length}`);
  assert.ok(!/автор:|знаток города/i.test(reviewsSection), 'Reviewer identity and city-expert badges must not be rendered');

  assert.ok(!/Софья Смотрина|Александр|Бегемот Бегимотович|Анастасия Д\.|Сергей Лотов|Владимир Бурлаков|Элина|Алексей Якимчук|Знаток города/.test(reviewsSection), 'Reviews must not expose author names or badges');

  for (const date of ['6 ноября', '13 сентября', '18 сентября', '14 сентября']) {
    assert.ok(reviewsSection.includes(date), `Missing confirmed review date: ${date}`);
  }

  // Must not contain invented star ratings or Yandex UI boilerplate
  assert.ok(!reviewsSection.includes('из 5'), 'Must not invent star ratings in reviews');
  assert.ok(!reviewsSection.includes('Посмотреть ответ организации'), 'Must remove Yandex UI boilerplate');

  const excerptMatches = [...reviewsSection.matchAll(/data-excerpt="([^"]+)"/g)];
  assert.equal(excerptMatches.length, 8);
  for (const [, excerpt] of excerptMatches) {
    assert.ok(excerpt.length <= 152, `Excerpt exceeds ~150 chars (${excerpt.length}): ${excerpt}`);
  }
});

test('Prices, supplied trainers, contacts, and opt-in map behavior match project-brief.md', () => {
  const html = readHtml();

  for (const price of ['6000 ₽', '1000 ₽', 'Пробное занятие бесплатно']) {
    assert.ok(html.includes(price), `Missing confirmed pricing item: ${price}`);
  }
  const pricing = html.match(/<section id="pricing"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(pricing.includes('12 тренировок'), 'Monthly plan must remain available');
  assert.ok(pricing.includes('Разовое посещение'), 'Single visit must remain available');
  assert.ok(!/8 тренировок|2000 ₽|персональн/i.test(pricing), 'Removed offers must not be advertised');

  assert.ok(!html.includes('Александр Тютрин'), 'Removed trainer must not remain on the page');
  const trainersSection = html.match(/<section id="trainers"[\s\S]*?<\/section>/)?.[0] || '';
  for (const name of ['Иван Сергеевич Закотенко', 'Максим Русланович Шибченко', 'Ольга Константиновна Тёкина']) {
    assert.ok(trainersSection.includes(name), `Missing trainer: ${name}`);
  }
  const portraits = [...trainersSection.matchAll(/<img\b[^>]*src="([^"]+)"/g)];
  assert.equal(portraits.length, 3, 'Every supplied trainer must have a real portrait');
  for (const [, src] of portraits) assert.ok(fs.existsSync(assetPath(src)));
  assert.ok(!trainersSection.includes('Данные уточняются'), 'Trainers must not contain empty placeholder cards');
  assert.ok(!trainersSection.includes('пока не загружена'), 'Trainers must not contain service placeholder messages');

  for (const contact of [
    'ул. Гагарина, 85',
    '+7 (995) 788-14-61',
    'https://t.me/tatamiadmin',
    'https://www.instagram.com/sc.tatami/',
    'https://vk.ru/sctatami',
    'https://t.me/sctatami',
    '55.610072',
    '38.073791',
  ]) {
    assert.ok(html.includes(contact), `Missing contact or map coordinate: ${contact}`);
  }

  assert.ok(!/mailto:|info@|Почта|почтов/i.test(html), 'No removed contact details may remain in the built page');
  const form = html.match(/<form[^>]*id="tatami-signup-form"[^>]*>/)?.[0];
  assert.ok(form && form.includes('hidden'), 'Personal fields must stay unavailable until the JS submit handler is installed');
  assert.ok(form.includes('data-telegram="https://t.me/tatamiadmin"'), 'Draft must target the administrator, not the public channel');
  assert.match(html, /<noscript>[\s\S]*?href="https:\/\/t\.me\/tatamiadmin"/, 'No-JS users must have a direct booking contact');
  // Embedded map iframe must NOT be present on initial load (only loaded when user clicks)
  assert.ok(!html.includes('<iframe'), 'Embedded map iframe must only load on user action');
  assert.ok(html.includes('id="load-map-btn"'), 'Opt-in map load button must exist');
});

test('All internal anchor links (#...) resolve to existing element IDs and no duplicate IDs exist', () => {
  const html = readHtml();
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const idSet = new Set();
  const duplicates = [];

  for (const id of ids) {
    if (idSet.has(id)) duplicates.push(id);
    idSet.add(id);
  }
  assert.deepEqual(duplicates, [], `Duplicate DOM IDs detected: ${duplicates.join(', ')}`);

  const hrefAnchors = [...html.matchAll(/\shref="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(hrefAnchors.length > 0, 'Expected internal anchor links');
  for (const targetId of hrefAnchors) {
    assert.ok(idSet.has(targetId), `Broken internal anchor link #${targetId}`);
  }
});

test('No placeholder phone, Formspree endpoint, or forbidden placeholder strings exist', () => {
  const html = readHtml();
  for (const forbidden of [
    'schedule_kids.png',
    'schedule_teens.png',
    'schedule_adults.png',
    '+7 (495) 123-45-67',
    'formspree.io',
    'Lorem ipsum',
    'TODO',
  ]) {
    assert.ok(!html.includes(forbidden), `Forbidden placeholder/unconfigured ref found: ${forbidden}`);
  }
});

test('JS + CSS + HTML bundle footprint stays well under 500 KB performance budget', () => {
  const astroAssetsDir = path.join(DIST_DIR, '_astro');
  assert.ok(fs.existsSync(astroAssetsDir), 'dist/_astro must exist');

  let totalCodeBytes = 0;
  for (const file of fs.readdirSync(astroAssetsDir)) {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      totalCodeBytes += fs.statSync(path.join(astroAssetsDir, file)).size;
    }
  }
  const htmlBytes = fs.statSync(INDEX_HTML_PATH).size;
  const totalBytes = totalCodeBytes + htmlBytes;

  assert.ok(
    totalBytes < 500 * 1024,
    `Expected HTML + CSS + JS bundle < 500 KB, got ${(totalBytes / 1024).toFixed(1)} KB`
  );
});
