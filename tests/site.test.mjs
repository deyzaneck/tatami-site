import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const NOT_FOUND_HTML_PATH = path.join(DIST_DIR, '404.html');
const PRIVACY_HTML_PATH = path.join(DIST_DIR, 'privacy', 'index.html');
const BASE_PREFIX = '/tatami-site/';
const SITE_ORIGIN = 'https://deyzaneck.github.io';

function resolveLocalUrlToDistPath(rawUrl, { allowSiteOrigin = false } = {}) {
  let urlPath = rawUrl;
  if (/^https?:\/\//i.test(rawUrl)) {
    const parsed = new URL(rawUrl);
    if (!allowSiteOrigin || parsed.origin !== SITE_ORIGIN) {
      return null;
    }
    urlPath = parsed.pathname;
  }

  assert.ok(
    urlPath.startsWith(BASE_PREFIX),
    `Local asset/page URL must start with "${BASE_PREFIX}", got: ${rawUrl}`,
  );

  const withoutHashAndQuery = urlPath.split('#')[0].split('?')[0];
  const rel = decodeURIComponent(withoutHashAndQuery.slice(BASE_PREFIX.length));
  let target = path.join(DIST_DIR, rel);
  if (rel === '' || withoutHashAndQuery.endsWith('/')) {
    target = path.join(target, 'index.html');
  }
  return target;
}

function assetPath(src) {
  return resolveLocalUrlToDistPath(src, { allowSiteOrigin: true });
}

function readHtml(filePath = INDEX_HTML_PATH) {
  assert.ok(fs.existsSync(filePath), `${path.relative(ROOT, filePath)} must exist after astro build`);
  return fs.readFileSync(filePath, 'utf8');
}

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'));
  return match ? match[1] : null;
}

test('Built index.html, 404.html, and privacy/index.html have semantic structure, lang=ru, and no ViewTransitions router', () => {
  const indexHtml = readHtml(INDEX_HTML_PATH);
  assert.match(indexHtml, /<html[^>]+lang="ru"/);
  assert.match(indexHtml, /<header[\s>]/);
  assert.match(indexHtml, /<main[^>]+id="main-content"/);
  assert.match(indexHtml, /<footer[\s>]/);
  assert.ok(!indexHtml.includes('astro-view-transitions'), 'Single-page site must not bundle ViewTransitions router');
  assert.ok(indexHtml.includes('SportsActivityLocation'), 'JSON-LD must include SportsActivityLocation');
  assert.ok(indexHtml.includes('FAQPage'), 'JSON-LD must include FAQPage');

  const notFoundHtml = readHtml(NOT_FOUND_HTML_PATH);
  assert.match(notFoundHtml, /<html[^>]+lang="ru"/);
  assert.match(notFoundHtml, /<meta[^>]+name="robots"[^>]+content="noindex, follow"/);
  assert.match(notFoundHtml, /<main[^>]+id="main-content"/);
  assert.ok(notFoundHtml.includes(`href="${BASE_PREFIX}"`), '404 page must link back to site root');

  const privacyHtml = readHtml(PRIVACY_HTML_PATH);
  assert.match(privacyHtml, /<html[^>]+lang="ru"/);
  assert.match(privacyHtml, /<main[^>]+id="main-content"/);
  assert.ok(privacyHtml.includes(`href="${BASE_PREFIX}#signup"`), 'Privacy page must link back to signup form');
});

test('Static assets (og-cover.jpg, robots.txt, favicon.svg, woff2 fonts) exist and obsolete .ttf / public/images are gone', () => {
  const indexHtml = readHtml(INDEX_HTML_PATH);

  assert.ok(fs.existsSync(path.join(ROOT, 'public', 'og-cover.jpg')), 'public/og-cover.jpg must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'og-cover.jpg')), 'dist/og-cover.jpg must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'robots.txt')), 'dist/robots.txt must exist');
  assert.ok(fs.existsSync(path.join(DIST_DIR, 'favicon.svg')), 'dist/favicon.svg must exist');
  assert.ok(fs.existsSync(NOT_FOUND_HTML_PATH), 'dist/404.html must exist');
  assert.ok(fs.existsSync(PRIVACY_HTML_PATH), 'dist/privacy/index.html must exist');

  const robotsTxt = fs.readFileSync(path.join(DIST_DIR, 'robots.txt'), 'utf8');
  assert.match(robotsTxt, /User-agent:\s*\*/);
  assert.match(robotsTxt, /Allow:\s*\//);

  const distFontsDir = path.join(DIST_DIR, 'fonts');
  assert.ok(fs.existsSync(distFontsDir), 'dist/fonts must exist');
  const fontFiles = fs.readdirSync(distFontsDir);
  const ttfFiles = fontFiles.filter((file) => file.endsWith('.ttf'));
  assert.deepEqual(ttfFiles, [], `dist/fonts must contain NO .ttf files, found: ${ttfFiles.join(', ')}`);
  const unused600 = fontFiles.filter((file) => file.includes('unbounded') && file.includes('600'));
  assert.deepEqual(unused600, [], `dist/fonts must not contain unused Unbounded 600 weights: ${unused600.join(', ')}`);
  const woff2Files = fontFiles.filter((file) => file.endsWith('.woff2'));
  assert.equal(woff2Files.length, 8, `Expected 8 .woff2 files in dist/fonts, found ${woff2Files.length}`);

  const astroDir = path.join(DIST_DIR, '_astro');
  for (const cssFile of fs.readdirSync(astroDir).filter((f) => f.endsWith('.css'))) {
    const cssText = fs.readFileSync(path.join(astroDir, cssFile), 'utf8');
    assert.ok(!cssText.includes('.ttf'), `${cssFile} must not reference .ttf font files`);
    for (const match of cssText.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
      const ref = match[2].trim();
      if (!ref || ref.startsWith('data:') || /^https?:\/\//i.test(ref)) continue;
      const resolved = ref.startsWith('/')
        ? resolveLocalUrlToDistPath(ref, { allowSiteOrigin: false })
        : path.resolve(astroDir, ref.split('#')[0].split('?')[0]);
      assert.ok(resolved && fs.existsSync(resolved), `${cssFile}: broken CSS url(${ref}) -> ${resolved}`);
    }
  }

  assert.ok(!fs.existsSync(path.join(ROOT, 'public', 'images', 'direction-gymnastics.webp')), 'Obsolete direction-gymnastics.webp must be removed');
  assert.ok(!fs.existsSync(path.join(ROOT, 'public', 'images')), 'Obsolete public/images directory must be removed');

  assert.ok(!indexHtml.includes('AppData'), 'HTML must not contain Temp path references');
  assert.ok(!indexHtml.includes('omp-image-'), 'HTML must not reference temporary image filenames');
});

test('Strict asset and link integrity across dist/index.html, dist/404.html, and dist/privacy/index.html', () => {
  const pages = [INDEX_HTML_PATH, NOT_FOUND_HTML_PATH, PRIVACY_HTML_PATH];

  for (const pagePath of pages) {
    const html = readHtml(pagePath);
    const label = path.relative(ROOT, pagePath);

    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
      const href = getAttr(match[0], 'href');
      assert.ok(href && href.length > 0, `${label}: <link> missing href: ${match[0]}`);
      if (!/^https?:\/\//i.test(href) || href.startsWith(SITE_ORIGIN)) {
        const resolved = resolveLocalUrlToDistPath(href, { allowSiteOrigin: true });
        assert.ok(resolved && fs.existsSync(resolved), `${label}: broken <link href="${href}"> -> ${resolved}`);
      }
    }

    for (const match of html.matchAll(/<script\b[^>]*>/gi)) {
      const src = getAttr(match[0], 'src');
      if (src !== null) {
        assert.ok(src.length > 0, `${label}: <script> has empty src: ${match[0]}`);
        const resolved = resolveLocalUrlToDistPath(src, { allowSiteOrigin: true });
        assert.ok(resolved && fs.existsSync(resolved), `${label}: broken <script src="${src}"> -> ${resolved}`);
      }
    }

    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0];
      assert.match(tag, /\salt="/, `${label}: <img> missing alt attribute: ${tag}`);
      const id = getAttr(tag, 'id');
      const src = getAttr(tag, 'src');
      const srcset = getAttr(tag, 'srcset');

      if (id === 'lightbox-img' && src === '') {
        continue;
      }

      assert.ok(src && src.length > 0, `${label}: <img> missing non-empty src: ${tag}`);
      const resolvedSrc = resolveLocalUrlToDistPath(src, { allowSiteOrigin: true });
      assert.ok(resolvedSrc && fs.existsSync(resolvedSrc), `${label}: broken <img src="${src}"> -> ${resolvedSrc}`);

      if (srcset !== null) {
        assert.ok(srcset.length > 0, `${label}: <img> has empty srcset: ${tag}`);
        for (const entry of srcset.split(',')) {
          const candidateUrl = entry.trim().split(/\s+/)[0];
          assert.ok(candidateUrl, `${label}: malformed srcset entry "${entry}" in ${tag}`);
          const resolvedCandidate = resolveLocalUrlToDistPath(candidateUrl, { allowSiteOrigin: true });
          assert.ok(
            resolvedCandidate && fs.existsSync(resolvedCandidate),
            `${label}: broken srcset URL "${candidateUrl}" -> ${resolvedCandidate}`,
          );
        }
      }
    }

    const ogImageMatch = html.match(/<meta\b[^>]*property="og:image"[^>]*>/i);
    assert.ok(ogImageMatch, `${label}: missing meta[property="og:image"]`);
    const ogImageContent = getAttr(ogImageMatch[0], 'content');
    assert.ok(ogImageContent, `${label}: meta[property="og:image"] missing content`);
    const resolvedOgImage = resolveLocalUrlToDistPath(ogImageContent, { allowSiteOrigin: true });
    assert.ok(
      resolvedOgImage && fs.existsSync(resolvedOgImage),
      `${label}: broken og:image "${ogImageContent}" -> ${resolvedOgImage}`,
    );

    const twitterImageMatch = html.match(/<meta\b[^>]*name="twitter:image"[^>]*>/i);
    assert.ok(twitterImageMatch, `${label}: missing meta[name="twitter:image"]`);
    const twitterImageContent = getAttr(twitterImageMatch[0], 'content');
    assert.ok(twitterImageContent, `${label}: meta[name="twitter:image"] missing content`);
    const resolvedTwitterImage = resolveLocalUrlToDistPath(twitterImageContent, { allowSiteOrigin: true });
    assert.ok(
      resolvedTwitterImage && fs.existsSync(resolvedTwitterImage),
      `${label}: broken twitter:image "${twitterImageContent}" -> ${resolvedTwitterImage}`,
    );

    for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
      const href = getAttr(match[0], 'href');
      if (!href || href.startsWith('#') || /^https?:\/\//i.test(href) || href.startsWith('tel:')) {
        continue;
      }
      const resolvedLink = resolveLocalUrlToDistPath(href, { allowSiteOrigin: false });
      assert.ok(resolvedLink && fs.existsSync(resolvedLink), `${label}: broken local <a href="${href}"> -> ${resolvedLink}`);
    }
  }
});

test('Gallery has 10 unique documentary hall photos, native <dialog> lightbox, and no conceptual illustrations', () => {
  const html = readHtml(INDEX_HTML_PATH);
  const gallerySectionMatch = html.match(/<section id="gallery"[\s\S]*?<\/section>/);
  assert.ok(gallerySectionMatch, 'Gallery section must exist');
  const galleryHtml = gallerySectionMatch[0];

  assert.match(galleryHtml, /<dialog\b[^>]*id="tatami-lightbox"/, 'Gallery lightbox must use native <dialog id="tatami-lightbox">');

  const filterButtons = [...galleryHtml.matchAll(/data-gallery-filter="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(filterButtons, ['Все', 'Тренировки', 'Залы', 'Клуб']);

  const itemMatches = [...galleryHtml.matchAll(/data-gallery-item[\s\S]*?data-full-src="([^"]+)"/g)];
  assert.equal(itemMatches.length, 10, `Expected 10 gallery items, got ${itemMatches.length}`);

  const fullSrcs = itemMatches.map(([, fullSrc]) => fullSrc);
  assert.equal(new Set(fullSrcs).size, 10, 'Gallery photos must be 10 unique assets with no duplicates');

  for (const fullSrc of fullSrcs) {
    assert.ok(fullSrc.includes('/_astro/'), `Gallery must only use documentary hall assets, got: ${fullSrc}`);
    const filePath = assetPath(fullSrc);
    assert.ok(fs.existsSync(filePath), `Missing built lightbox asset: ${filePath}`);
  }

  assert.ok(!galleryHtml.includes('/images/direction-'), 'Gallery must not contain conceptual illustrations');
  const trainersSectionMatch = html.match(/<section id="trainers"[\s\S]*?<\/section>/);
  assert.ok(trainersSectionMatch, 'Trainers section must exist');
  assert.ok(!trainersSectionMatch[0].includes('/images/'), 'Trainers must not use generated portraits');
});

test('Booking offers only three directions without group selection or unconfirmed time slots, and trainers link to directions', () => {
  const html = readHtml(INDEX_HTML_PATH);
  const select = html.match(/<select[^>]+id="signup-direction"[^>]*>([\s\S]*?)<\/select>/)?.[1];
  assert.ok(select, 'Direction selector must exist');
  const options = [...select.matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)]
    .map(([, value, label]) => [value, label]);
  assert.deepEqual(options, [['judo', 'Дзюдо'], ['muay-thai', 'Тайский бокс'], ['stretching', 'Стретчинг']]);

  const directionsSection = html.match(/<section id="directions"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(directionsSection.length > 0, 'Directions section must exist');
  const directionChoices = [...directionsSection.matchAll(/data-select-direction="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(directionChoices, ['judo', 'muay-thai', 'stretching'], 'Every direction CTA must select its own direction');

  const trainersSection = html.match(/<section id="trainers"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(trainersSection.length > 0, 'Trainers section must exist');
  const trainerChoices = [...trainersSection.matchAll(/data-select-direction="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(trainerChoices, ['judo', 'muay-thai', 'stretching'], 'All 3 trainer booking links must have data-select-direction');

  const planSelect = html.match(/<select[^>]+id="signup-plan"[^>]*>([\s\S]*?)<\/select>/)?.[1];
  assert.ok(planSelect, 'Plan selector must exist');
  const planValues = [...planSelect.matchAll(/<option value="([^"]+)"/g)].map(([, value]) => value);
  assert.deepEqual(planValues, ['trial', 'sub-3-week', 'single']);

  assert.ok(!html.includes('signup-group'), 'Booking must not ask clients to choose groups');
  assert.ok(!html.includes('data-schedule-card'), 'Group picking has moved to Telegram');
  assert.ok(!/акробат|гимнаст|джиу-джитсу/i.test(directionsSection), 'Only current booking directions may be advertised');
});

test('All 8 real Yandex reviews appear without invented stars, author names, or fake dates, plus Yandex reviews link', () => {
  const html = readHtml(INDEX_HTML_PATH);
  const reviewsSection = html.match(/<section id="reviews"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(reviewsSection.length > 0, 'Reviews section must exist');

  assert.ok(
    reviewsSection.includes('https://yandex.ru/maps/org/tatami/84010828701/reviews/'),
    'Reviews section must link to Yandex Maps reviews org 84010828701',
  );

  const slideMatches = [...reviewsSection.matchAll(/data-review-slide/g)];
  assert.equal(slideMatches.length, 8, `Expected 8 review slides, got ${slideMatches.length}`);
  assert.ok(!/автор:|знаток города/i.test(reviewsSection), 'Reviewer identity and city-expert badges must not be rendered');

  assert.ok(
    !/Софья Смотрина|Александр|Бегемот Бегимотович|Анастасия Д\.|Сергей Лотов|Владимир Бурлаков|Элина|Алексей Якимчук|Знаток города/.test(reviewsSection),
    'Reviews must not expose author names or badges',
  );

  for (const date of ['6 ноября', '13 сентября', '18 сентября', '14 сентября']) {
    assert.ok(reviewsSection.includes(date), `Missing confirmed review date: ${date}`);
  }

  assert.ok(!reviewsSection.includes('из 5'), 'Must not invent star ratings in reviews');
  assert.ok(!reviewsSection.includes('Посмотреть ответ организации'), 'Must remove Yandex UI boilerplate');

  const excerptMatches = [...reviewsSection.matchAll(/data-excerpt="([^"]+)"/g)];
  assert.equal(excerptMatches.length, 8);
  for (const [, excerpt] of excerptMatches) {
    assert.ok(excerpt.length <= 152, `Excerpt exceeds ~150 chars (${excerpt.length}): ${excerpt}`);
  }
});

test('FAQ section contains confirmed age, sportswear, and schedule orientation facts', () => {
  const html = readHtml(INDEX_HTML_PATH);
  const faqSection = html.match(/<section id="faq"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(faqSection.length > 0, 'FAQ section must exist');

  const items = [...faqSection.matchAll(/<details\b[^>]*class="faq-item"/g)];
  assert.ok(items.length >= 5, `Expected at least 5 FAQ items, got ${items.length}`);

  const faqLower = faqSection.toLowerCase();
  assert.ok(faqLower.includes('от 6 лет'), 'FAQ must state age from 6 years');
  assert.ok(faqLower.includes('футболк'), 'FAQ must mention t-shirt (футболка)');
  assert.ok(faqLower.includes('шорт'), 'FAQ must mention shorts (шорты)');
});

test('Prices, supplied trainers, contacts, 152-FZ consent, and opt-in map behavior match project-brief.md', () => {
  const html = readHtml(INDEX_HTML_PATH);

  for (const price of ['6000 ₽', '1000 ₽', 'Пробное занятие бесплатно']) {
    assert.ok(html.includes(price), `Missing confirmed pricing item: ${price}`);
  }
  const pricing = html.match(/<section id="pricing"[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok(pricing.includes('Абонемент на месяц'), 'Monthly subscription title must remain available');
  assert.ok(pricing.includes('3 тренировки в неделю'), 'Weekly monthly plan must remain available');
  assert.ok(pricing.includes('Разовое посещение'), 'Single visit must remain available');
  assert.ok(!/12 тренировок|8 тренировок|2000 ₽|персональн/i.test(pricing), 'Removed offers must not be advertised');

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

  const signupSection = html.match(/<div id="signup"[\s\S]*?<\/form>/)?.[0] || '';
  assert.ok(signupSection.length > 0, 'Signup section must exist');
  assert.ok(signupSection.includes('id="signup-consent"'), 'Signup form must include signup-consent checkbox');
  assert.ok(signupSection.includes(`href="${BASE_PREFIX}privacy/"`), 'Signup consent must link to /privacy/');

  const form = html.match(/<form[^>]*id="tatami-signup-form"[^>]*>/)?.[0];
  assert.ok(form && form.includes('hidden'), 'Personal fields must stay unavailable until the JS submit handler is installed');
  assert.ok(form.includes('data-telegram="https://t.me/tatamiadmin"'), 'Draft must target the administrator, not the public channel');
  assert.match(html, /<noscript>[\s\S]*?href="https:\/\/t\.me\/tatamiadmin"/, 'No-JS users must have a direct booking contact');

  // Embedded map iframe must NOT be present on initial load (only loaded when user clicks)
  assert.ok(!html.includes('<iframe'), 'Embedded map iframe must only load on user action');
  assert.ok(html.includes('id="load-map-btn"'), 'Opt-in map load button must exist');
});

test('All internal anchor links (#...) resolve to existing element IDs and no duplicate IDs exist across built pages', () => {
  const indexHtml = readHtml(INDEX_HTML_PATH);
  const indexIdSet = new Set([...indexHtml.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  for (const pagePath of [INDEX_HTML_PATH, NOT_FOUND_HTML_PATH, PRIVACY_HTML_PATH]) {
    const html = readHtml(pagePath);
    const label = path.relative(ROOT, pagePath);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const idSet = new Set();
    const duplicates = [];

    for (const id of ids) {
      if (idSet.has(id)) duplicates.push(id);
      idSet.add(id);
    }
    assert.deepEqual(duplicates, [], `${label}: duplicate DOM IDs detected: ${duplicates.join(', ')}`);

    const hrefAnchors = [...html.matchAll(/\shref="#([^"]+)"/g)].map((m) => m[1]);
    for (const targetId of hrefAnchors) {
      assert.ok(idSet.has(targetId), `${label}: broken internal anchor link #${targetId}`);
    }

    const baseAnchors = [...html.matchAll(new RegExp(`\\shref="${BASE_PREFIX}#([^"]+)"`, 'g'))].map((m) => m[1]);
    for (const targetId of baseAnchors) {
      assert.ok(indexIdSet.has(targetId), `${label}: broken cross-page anchor link ${BASE_PREFIX}#${targetId}`);
    }
  }
});

test('No placeholder phone, Formspree endpoint, or forbidden placeholder strings exist', () => {
  const html = readHtml(INDEX_HTML_PATH);
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
    `Expected HTML + CSS + JS bundle < 500 KB, got ${(totalBytes / 1024).toFixed(1)} KB`,
  );
});
