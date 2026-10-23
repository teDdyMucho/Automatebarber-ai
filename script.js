/* =========================================================
   Automatebarber.ai
   Data lives here. Prices and visits are saved in the browser
   (localStorage) until a real backend is connected.
   ========================================================= */

// Default prices are the medians of 15 independent US barbershops' published menus
// (researched 22 Oct 2026, sources in prd/pricing-research.md). Durations are this shop's own.
const SERVICES = [
  { id: 'signature', name: 'Signature Cut',         group: 'Haircuts',        mins: 45, price: 50, every: 4 },
  { id: 'fade',      name: 'Skin Fade',             group: 'Haircuts',        mins: 50, price: 55, every: 3 },
  { id: 'kids',      name: 'Kids Cut, 12 and under', group: 'Haircuts',       mins: 30, price: 35, every: 4 },
  { id: 'senior',    name: 'Senior and Military',   group: 'Haircuts',        mins: 45, price: 45, every: 4 },
  { id: 'shave',     name: 'Hot Towel Shave',       group: 'Shave and Beard', mins: 40, price: 50, every: 2 },
  { id: 'beard',     name: 'Beard Sculpt',          group: 'Shave and Beard', mins: 30, price: 30, every: 2 },
  { id: 'lineup',    name: 'Line-Up',               group: 'Shave and Beard', mins: 15, price: 25, every: 2 },
  { id: 'headshave', name: 'Head Shave',            group: 'Shave and Beard', mins: 35, price: 45, every: 1 },
  { id: 'full',      name: 'The Full Service',      group: 'Featured',        mins: 80, price: 110, every: 3 },
];

const BARBERS = [
  { id: 'marcus', name: 'Marcus Reed',   img: 'images/barber-marcus-sm.jpg' },
  { id: 'andre',  name: 'Andre Morales', img: 'images/barber-dre-sm.jpg' },
  { id: 'tony',   name: 'Tony Lombardi', img: 'images/barber-tony-sm.jpg' },
  { id: 'sam',    name: 'Sam Kwan',      img: 'images/barber-sam-sm.jpg' },
];

// Style consult rules: each style lists the answers it suits.
const STYLES = [
  { name: 'Textured crop with a mid fade', service: 'fade', barber: 'sam', weeks: 3,
    hair: ['straight', 'wavy', 'curly'], face: ['round', 'oval', 'square'], pref: ['trendy', 'low'],
    why: 'Texture on top adds shape without daily styling, and the fade keeps the sides clean.' },
  { name: 'Classic side part with a low taper', service: 'signature', barber: 'marcus', weeks: 4,
    hair: ['straight', 'wavy'], face: ['oval', 'square', 'long'], pref: ['classic', 'sharp'],
    why: 'A timeless shape that balances your proportions and looks right in any setting.' },
  { name: 'Quiff with a high fade', service: 'fade', barber: 'andre', weeks: 3,
    hair: ['straight', 'wavy'], face: ['round', 'oval'], pref: ['trendy', 'sharp'],
    why: 'Height on top lengthens a rounder face, and the high fade adds a crisp contrast.' },
  { name: 'Crew cut', service: 'signature', barber: 'marcus', weeks: 4,
    hair: ['straight', 'wavy', 'curly', 'coily'], face: ['square', 'oval', 'long'], pref: ['low', 'classic'],
    why: 'Short, neat and almost zero effort in the morning. It works with a strong jawline.' },
  { name: 'Curly top with a taper fade', service: 'fade', barber: 'sam', weeks: 3,
    hair: ['curly', 'coily'], face: ['oval', 'round', 'long'], pref: ['trendy', 'classic'],
    why: 'Lets your natural curl be the feature while the taper keeps the outline tidy.' },
  { name: 'Waves with a sharp line-up', service: 'signature', barber: 'andre', weeks: 2,
    hair: ['coily'], face: ['oval', 'round', 'square', 'long'], pref: ['sharp', 'classic'],
    why: 'A clean, even length that holds waves well, finished with a razor-sharp hairline.' },
  { name: 'Buzz cut with a skin fade', service: 'fade', barber: 'andre', weeks: 2,
    hair: ['straight', 'wavy', 'curly', 'coily'], face: ['oval', 'square'], pref: ['low', 'sharp'],
    why: 'The lowest maintenance cut there is, kept sharp by the fade.' },
];

// Opening hours by weekday (0 = Sunday), 24h clock. Keep in sync with the hours table.
const HOURS = { 0: [10, 16], 1: [10, 19], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [8, 21], 6: [8, 18] };

// Rewards: every Nth completed haircut is free. Shave and beard services don't count.
const REWARD_EVERY = 8;
const HAIRCUT_IDS = ['signature', 'fade', 'kids', 'senior', 'full'];
const MAX_GUESTS = 3;

const SHOP = { name: 'Automatebarber.ai', address: '123 Main Street, Your City, ST 00000' };

/* ---------- Storage helpers ---------- */
const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};

const DEFAULT_PRICES = Object.fromEntries(SERVICES.map(s => [s.id, s.price]));
// Versioned: the defaults moved to researched US prices, so price maps saved against the
// old defaults are left behind rather than masking the new menu.
const PRICES_KEY = 'ab_prices_v2';
const PRICES_UPDATED_KEY = 'ab_prices_updated_v2';
let prices = { ...DEFAULT_PRICES, ...store.get(PRICES_KEY, {}) };
let pricesUpdated = store.get(PRICES_UPDATED_KEY, null);
let visits = store.get('ab_visits', []);

// Records are looked up by mobile number (last 10 digits).
const phoneKey = p => String(p || '').replace(/\D/g, '').slice(-10);
const formatPhone = k => k.length === 10 ? `(${k.slice(0, 3)}) ${k.slice(3, 6)}-${k.slice(6)}` : k;
let currentPhone = store.get('ab_phone', '');
const mine = () => (currentPhone ? visits.filter(v => phoneKey(v.phone) === currentPhone) : []);

const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.classList.contains('nomotion');
const service = id => SERVICES.find(s => s.id === id);
const barber = id => BARBERS.find(b => b.id === id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = n => `$${Number(n).toFixed(Number.isInteger(+n) ? 0 : 2)}`;
const toISO = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtDate = (iso, opts = { weekday: 'short', month: 'short', day: 'numeric' }) =>
  new Date(iso + 'T00:00').toLocaleDateString('en-US', opts);

// "10:30 AM" on a YYYY-MM-DD date -> Date
function atTime(isoDate, label) {
  const [, hh, mm, ap] = String(label).match(/(\d+):(\d+)\s*(AM|PM)/i) || [];
  const d = new Date(isoDate + 'T00:00');
  if (hh) d.setHours((+hh % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0), +mm);
  return d;
}
const visitStart = v => atTime(v.date, v.time);
const timeLabel = d => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/* ---------- Calendar files (.ics) ---------- */
const icsStamp = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
const icsText = s => String(s).replace(/[\\,;]/g, m => '\\' + m).replace(/\n/g, '\\n');

function downloadIcs(filename, event) {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Automatebarber.ai//Booking//EN', 'BEGIN:VEVENT',
    `UID:${event.uid}@automatebarber.ai`, `DTSTAMP:${icsStamp(new Date())}`,
    event.allDay ? `DTSTART;VALUE=DATE:${icsStamp(event.start).slice(0, 8)}` : `DTSTART:${icsStamp(event.start)}`,
    event.allDay ? '' : `DTEND:${icsStamp(event.end)}`,
    `SUMMARY:${icsText(event.title)}`, `DESCRIPTION:${icsText(event.description)}`, `LOCATION:${icsText(SHOP.address)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(event.title)}`, `TRIGGER:${event.allDay ? 'PT9H' : '-PT1H'}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function visitToCalendar(v) {
  const s = service(v.service);
  const start = visitStart(v);
  downloadIcs(`automatebarber-${v.date}.ics`, {
    uid: v.id, start, end: new Date(start.getTime() + s.mins * 60000),
    title: `${s.name} at ${SHOP.name}`,
    description: `With ${barber(v.barber).name}.${v.notes ? ' Notes: ' + v.notes : ''}`,
  });
}

/* ---------- Rewards ---------- */
function rewardState() {
  const live = mine().filter(v => v.status !== 'cancelled');
  const stamps = mine().filter(v => v.status === 'completed' && !v.reward && !v.guestOf && HAIRCUT_IDS.includes(v.service)).length;
  const used = live.filter(v => v.reward).length;
  return { stamps, available: Math.floor(stamps / REWARD_EVERY) - used, onCard: stamps % REWARD_EVERY };
}

function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('is-on');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('is-on'), 3200);
}

/* =========================================================
   1. PRICES: menu, booking options, staff editor
   ========================================================= */
// Prices on the menu roll like a mechanical counter when the menu first comes into view,
// and again for any price the staff change, so a live update is visible as one.
let menuSeen = false;
let menuPrev = {};

function rollPrice(el) {
  const final = el.textContent;
  if (reducedMotion) return;
  let frame = 0;
  clearInterval(el.rollTimer);
  el.rollTimer = setInterval(() => {
    frame += 1;
    el.textContent = frame >= 8 ? final
      : [...final].map((c, i) => (/\d/.test(c) && frame < 8 - (i % 3)) ? Math.floor(Math.random() * 10) : c).join('');
    if (frame >= 8) clearInterval(el.rollTimer);
  }, 55);
}

function renderMenu() {
  const groups = ['Haircuts', 'Shave and Beard'];
  $('menu').innerHTML = groups.map(g => `
    <div class="menu__group">
      <h3 class="menu__title">${g}</h3>
      <dl>
        ${SERVICES.filter(s => s.group === g).map(s => `
          <div class="item">
            <dt>${s.name} <small>${s.mins} min</small></dt>
            <dd data-id="${s.id}">${money(prices[s.id])}</dd>
          </div>`).join('')}
      </dl>
    </div>`).join('');
  if (menuSeen) $('menu').querySelectorAll('dd').forEach(dd => { if (menuPrev[dd.dataset.id] !== prices[dd.dataset.id]) rollPrice(dd); });
  menuPrev = { ...prices };

  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money(prices[el.dataset.price]); });
  $('pricesUpdated').textContent = pricesUpdated
    ? `Prices updated ${fmtDate(pricesUpdated, { month: 'long', day: 'numeric', year: 'numeric' })}`
    : '';
}

const serviceOptions = () => '<option value="">Choose a service</option>' +
  SERVICES.map(s => `<option value="${s.id}">${s.name}, ${money(prices[s.id])}</option>`).join('');

function renderServiceOptions() {
  document.querySelectorAll('#fService, [data-guest-service]').forEach(sel => {
    const current = sel.value;
    sel.innerHTML = serviceOptions();
    sel.value = current;
  });
}

function renderBarberOptions() {
  $('fBarber').innerHTML = '<option value="any">First available</option>' +
    BARBERS.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
}

function renderStaffRows() {
  $('staffRows').innerHTML = SERVICES.map(s => `
    <label class="staff__row">
      <span>${s.name}<small>${s.mins} min</small></span>
      <span class="staff__input">
        <span aria-hidden="true">$</span>
        <input type="number" min="0" step="1" inputmode="decimal" name="${s.id}" value="${prices[s.id]}" aria-label="${s.name} price in dollars" required>
      </span>
    </label>`).join('');
}

/* ---------- Online services highlight (live data) ---------- */
const hourLabel = h => new Date(2000, 0, 1, h).toLocaleTimeString('en-US', { hour: 'numeric' }).replace(' ', '').toLowerCase();

// The status line and the barber pole read the same hours: the pole turns only while open.
function renderOpenStatus() {
  const now = new Date();
  const [open, close] = HOURS[now.getDay()];
  const hour = now.getHours() + now.getMinutes() / 60;
  const isOpen = hour >= open && hour < close;
  const text = isOpen ? `Open now until ${hourLabel(close)}`
    : hour < open ? `Opens today at ${hourLabel(open)}`
    : `Closed now. Opens tomorrow at ${hourLabel(HOURS[(now.getDay() + 1) % 7][0])}`;
  $('hlOpen').textContent = text;
  $('heroOpen').textContent = text;
  document.querySelectorAll('.live').forEach(el => el.classList.toggle('is-open', isOpen));
  $('pole').classList.toggle('is-open', isOpen);
}

function renderHighlights() {
  $('hlPrices').innerHTML = ['signature', 'fade', 'shave', 'full'].map(id =>
    `<div><dt>${service(id).name}</dt><dd>${money(prices[id])}</dd></div>`).join('');
  $('hlVisits').textContent = currentPhone ? mine().filter(v => v.status === 'completed' && !v.guestOf).length : '-';
  $('hlDue').textContent = !currentPhone ? 'Look up by phone'
    : $('sDue').textContent === 'Book your first visit' ? 'Not booked' : $('sDue').textContent;
}

function refreshPrices() {
  renderMenu();
  renderServiceOptions();
  renderSummary();
  renderConsult();
  renderVisits();
}

const staff = $('staff');
$('openStaff').addEventListener('click', () => { renderStaffRows(); staff.showModal(); });
$('closeStaff').addEventListener('click', () => staff.close());
staff.addEventListener('click', e => { if (e.target === staff) staff.close(); });

$('staffForm').addEventListener('submit', e => {
  const inputs = [...$('staffRows').querySelectorAll('input')];
  const bad = inputs.find(i => i.value === '' || Number(i.value) < 0);
  if (bad) { e.preventDefault(); bad.focus(); return; }
  inputs.forEach(i => { prices[i.name] = Number(i.value); });
  pricesUpdated = toISO(new Date());
  store.set(PRICES_KEY, prices);
  store.set(PRICES_UPDATED_KEY, pricesUpdated);
  refreshPrices();
  toast('Prices saved. The menu and booking form are updated.');
});

$('resetPrices').addEventListener('click', () => {
  prices = { ...DEFAULT_PRICES };
  pricesUpdated = null;
  store.set(PRICES_KEY, {});
  store.set(PRICES_UPDATED_KEY, null);
  renderStaffRows();
  refreshPrices();
  toast('Prices reset to defaults.');
});

/* =========================================================
   2. STYLE CONSULT
   ========================================================= */
const quiz = $('quiz');
let recommendation = null;

function renderConsult() {
  const data = Object.fromEntries(new FormData(quiz));
  const answered = ['hair', 'face', 'pref', 'beard'].filter(k => data[k]).length;
  $('quizProgress').textContent = `${answered} of 4 answered`;

  if (answered < 4) {
    $('resultEmpty').hidden = false;
    $('resultCard').hidden = true;
    recommendation = null;
    return;
  }

  const scored = STYLES.map(s => ({
    ...s,
    score: (s.hair.includes(data.hair) ? 3 : 0) + (s.face.includes(data.face) ? 2 : 0) + (s.pref.includes(data.pref) ? 3 : 0),
  })).sort((a, b) => b.score - a.score);
  const pick = scored[0];

  // A full beard turns the cut into the Full Service; stubble gets a note.
  const svcId = data.beard === 'full' ? 'full' : pick.service;
  let why = pick.why;
  if (data.beard === 'full') why += ' With a full beard, the Full Service keeps cut and beard in balance.';
  if (data.beard === 'stubble') why += ' Ask for a quick stubble tidy at the end of your cut.';

  recommendation = { service: svcId, barber: pick.barber, style: pick.name };
  const b = barber(pick.barber);
  $('rStyle').textContent = pick.name;
  $('rWhy').textContent = why;
  $('rService').textContent = service(svcId).name;
  $('rPrice').textContent = money(prices[svcId]);
  $('rEvery').textContent = `${pick.weeks} week${pick.weeks > 1 ? 's' : ''}`;
  $('rBarber').textContent = b.name;
  $('rBarberImg').src = b.img;
  $('rBarberImg').alt = b.name;
  $('resultEmpty').hidden = true;
  $('resultCard').hidden = false;
}

quiz.addEventListener('change', renderConsult);
$('rBook').addEventListener('click', () => {
  if (!recommendation) return;
  prefillBooking(recommendation.service, recommendation.barber, `Consult: ${recommendation.style}`);
});

/* =========================================================
   3. BOOKING
   ========================================================= */
const form = $('bookingForm');
const dateInput = $('bookDate');
const timeSelect = $('bookTime');
const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 30);
dateInput.min = toISO(new Date());
dateInput.max = toISO(maxDate);

function fillTimes() {
  const prev = timeSelect.value;
  timeSelect.innerHTML = '';
  if (!dateInput.value) { timeSelect.add(new Option('Pick a date first', '')); return; }
  timeSelect.add(new Option('Choose a time', ''));

  const day = new Date(dateInput.value + 'T00:00');
  const [open, close] = HOURS[day.getDay()];
  const now = new Date();
  const chosenBarber = $('fBarber').value;
  const taken = visits
    .filter(v => v.status === 'upcoming' && v.date === dateInput.value && (chosenBarber === 'any' || v.barber === chosenBarber))
    .map(v => v.time);

  for (let h = open; h < close; h++) {
    for (const m of [0, 30]) {
      const slot = new Date(day); slot.setHours(h, m);
      if (slot <= now) continue;
      const label = slot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const opt = new Option(taken.includes(label) ? `${label} (you're booked)` : label, label);
      opt.disabled = taken.includes(label);
      timeSelect.add(opt);
    }
  }
  if (timeSelect.options.length === 1) timeSelect.options[0].text = 'Fully booked, try another day';
  timeSelect.value = prev;
}

/* ---------- Group booking ---------- */
const guestList = $('guestList');
let guestSeq = 0;

function updateGuestButton() {
  const full = guestList.children.length >= MAX_GUESTS;
  $('addGuest').disabled = full;
  $('addGuest').lastChild.textContent = full ? ' Group is full' : ' Add a person';
}

function addGuest() {
  if (guestList.children.length >= MAX_GUESTS) return;
  const id = `guest${++guestSeq}`;
  const row = document.createElement('div');
  row.className = 'guest';
  row.innerHTML = `
    <div class="field">
      <label for="${id}n">Guest name</label>
      <input type="text" id="${id}n" data-guest-name required>
      <p class="field__error">Please enter a name.</p>
    </div>
    <div class="field">
      <label for="${id}s">Service</label>
      <select id="${id}s" data-guest-service required>${serviceOptions()}</select>
      <p class="field__error">Please choose a service.</p>
    </div>
    <button type="button" class="icon-btn guest__remove" aria-label="Remove guest"><i class="ph-light ph-x" aria-hidden="true"></i></button>`;
  guestList.append(row);
  updateGuestButton();
  renderSummary();
  row.querySelector('input').focus();
}

$('addGuest').addEventListener('click', addGuest);
guestList.addEventListener('click', e => {
  if (!e.target.closest('.guest__remove')) return;
  e.target.closest('.guest').remove();
  updateGuestButton();
  renderSummary();
});
guestList.addEventListener('input', renderSummary);
guestList.addEventListener('change', renderSummary);

/* ---------- Summary, rewards toggle, your usual ---------- */
function rewardApplies() {
  return $('useReward').checked && HAIRCUT_IDS.includes($('fService').value);
}

function renderSummary() {
  const box = $('bookSummary');
  const lines = [];
  const s = service($('fService').value);
  if (s) lines.push({ label: s.name, mins: s.mins, price: rewardApplies() ? 0 : prices[s.id] });
  guestList.querySelectorAll('.guest').forEach(g => {
    const gs = service(g.querySelector('select').value);
    const who = g.querySelector('input').value.trim() || 'guest';
    if (gs) lines.push({ label: `${gs.name} for ${who}`, mins: gs.mins, price: prices[gs.id] });
  });
  if (!lines.length) { box.hidden = true; return; }

  const total = lines.reduce((t, l) => t + l.price, 0);
  const mins = lines.reduce((t, l) => t + l.mins, 0);
  const row = l => `<div class="summary__row"><span>${esc(l.label)} <small>${l.mins} min</small></span><strong>${l.price === 0 ? 'Free' : money(l.price)}</strong></div>`;
  box.hidden = false;
  box.innerHTML = lines.map(row).join('') +
    (lines.length > 1 ? `<div class="summary__row summary__total"><span>Total <small>${mins} min</small></span><strong>${money(total)}</strong></div>` : '') +
    ($('useReward').checked && s && !rewardApplies() ? '<p class="summary__note">Your reward applies to haircuts only.</p>' : '');
}

function renderRewardToggle() {
  const { available } = rewardState();
  $('rewardToggle').hidden = available < 1;
  if (available < 1) $('useReward').checked = false;
}

let usual = null;
function renderUsual() {
  const own = mine().filter(v => v.status !== 'cancelled' && !v.guestOf);
  if (!own.length) { $('usual').hidden = true; usual = null; return; }

  const combos = {};
  own.forEach(v => { const k = `${v.service}|${v.barber}`; combos[k] = (combos[k] || 0) + 1; });
  const [svc, bar] = Object.entries(combos).sort((a, b) => b[1] - a[1])[0][0].split('|');
  const last = own.reduce((a, b) => (visitStart(a) > visitStart(b) ? a : b));
  const lastNotes = own.filter(v => v.service === svc && v.barber === bar && v.notes).pop();
  usual = { svc, bar, notes: lastNotes ? lastNotes.notes : '' };

  $('usualText').textContent = `${service(svc).name} with ${barber(bar).name}, ${money(prices[svc])}`;
  $('usual').hidden = false;
  if (!$('fName').value) $('fName').value = last.name;
  if (!$('fPhone').value) $('fPhone').value = last.phone;
}

$('useUsual').addEventListener('click', () => {
  if (!usual) return;
  $('fService').value = usual.svc;
  $('fBarber').value = usual.bar;
  if (usual.notes) $('fNotes').value = usual.notes;
  renderSummary();
  fillTimes();
  dateInput.focus();
  toast('Your usual is filled in. Just pick a date and time.');
});
$('useReward').addEventListener('change', renderSummary);

function prefillBooking(serviceId, barberId, notes) {
  $('fService').value = serviceId || '';
  $('fBarber').value = barberId || 'any';
  if (notes !== undefined) $('fNotes').value = notes;
  renderSummary();
  fillTimes();
  document.getElementById('book').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  setTimeout(() => dateInput.focus({ preventScroll: true }), 600);
}

document.querySelectorAll('[data-book-service]').forEach(b => {
  b.addEventListener('click', () => prefillBooking(b.dataset.bookService));
});
// "Book with Marcus": the barber is chosen, the service is left for the customer.
document.querySelectorAll('[data-book-barber]').forEach(b => {
  b.addEventListener('click', () => prefillBooking($('fService').value, b.dataset.bookBarber));
});
dateInput.addEventListener('change', fillTimes);
$('fBarber').addEventListener('change', fillTimes);
$('fService').addEventListener('change', renderSummary);

function validate(input) {
  let ok = input.value.trim() !== '';
  if (input.type === 'tel') ok = input.value.replace(/\D/g, '').length >= 10;
  input.closest('.field').classList.toggle('is-invalid', !ok);
  return ok;
}

const roundUp30 = d => {
  const r = new Date(d);
  if (r.getMinutes() % 30) r.setMinutes(r.getMinutes() + 30 - (r.getMinutes() % 30), 0, 0);
  return r;
};

form.addEventListener('submit', e => {
  e.preventDefault();
  const msg = $('formMsg');
  const required = [...form.querySelectorAll('[required]')];
  const results = required.map(validate);
  if (results.includes(false)) {
    msg.textContent = '';
    required[results.indexOf(false)].focus();
    return;
  }

  const data = Object.fromEntries(new FormData(form));
  const barberId = data.barber === 'any' ? BARBERS[Math.floor(Math.random() * BARBERS.length)].id : data.barber;
  const useReward = rewardApplies() && rewardState().available > 0;
  const main = {
    id: Date.now().toString(36),
    service: data.service,
    barber: barberId,
    date: data.date,
    time: data.time,
    price: useReward ? 0 : prices[data.service],
    reward: useReward,
    name: data.name.trim(),
    phone: data.phone.trim(),
    notes: data.notes.trim(),
    status: 'upcoming',
  };

  // Guests follow back to back with the same barber
  const closeAt = atTime(data.date, '12:00 AM');
  closeAt.setHours(HOURS[closeAt.getDay()][1], 0, 0, 0);
  let cursor = new Date(visitStart(main).getTime() + service(main.service).mins * 60000);
  const guests = [...guestList.querySelectorAll('.guest')].map((g, i) => {
    cursor = roundUp30(cursor);
    const svc = g.querySelector('select').value;
    const guest = {
      id: `${main.id}g${i}`, service: svc, barber: barberId, date: data.date, time: timeLabel(cursor),
      price: prices[svc], name: g.querySelector('input').value.trim(), phone: main.phone,
      notes: '', status: 'upcoming', guestOf: main.id,
    };
    cursor = new Date(cursor.getTime() + service(svc).mins * 60000);
    return guest;
  });
  if (cursor > closeAt) {
    msg.className = 'form__msg is-err';
    msg.textContent = `There isn't enough time before closing for everyone. Please pick an earlier time.`;
    timeSelect.focus();
    return;
  }

  visits.push(main, ...guests);
  currentPhone = phoneKey(main.phone);
  store.set('ab_phone', currentPhone);
  saveVisits();

  // Front end only: send `main` and `guests` to your booking provider (Square, Booksy, Calendly, etc.) here.
  const guestText = guests.length ? ` Guests: ${guests.map(g => `${esc(g.name)} at ${g.time}`).join(', ')}.` : '';
  msg.className = 'form__msg is-ok';
  msg.innerHTML = `You're booked, ${esc(main.name.split(' ')[0])}. ${service(main.service).name}${main.reward ? ' (free reward)' : ''} with ${barber(main.barber).name}, ${fmtDate(main.date)} at ${main.time}.${guestText}
    <span class="form__actions"><button type="button" class="mini-link" data-ics="${main.id}"><i class="ph-light ph-calendar-plus" aria-hidden="true"></i> Add to calendar</button> <a href="#records">View in My visits</a></span>`;

  const keep = { name: data.name, phone: data.phone };
  form.reset();
  guestList.innerHTML = '';
  updateGuestButton();
  $('fName').value = keep.name;
  $('fPhone').value = keep.phone;
  renderSummary();
  fillTimes();
});

$('formMsg').addEventListener('click', e => {
  const b = e.target.closest('[data-ics]');
  if (b) visitToCalendar(visits.find(v => v.id === b.dataset.ics));
});

form.addEventListener('input', e => {
  if (e.target.closest('.field')?.classList.contains('is-invalid')) validate(e.target);
});
form.addEventListener('change', e => {
  if (e.target.closest('.field')?.classList.contains('is-invalid')) validate(e.target);
});

/* =========================================================
   4. MY VISITS (records)
   ========================================================= */
let activeTab = 'upcoming';

function saveVisits() {
  store.set('ab_visits', visits);
  renderVisits();
}

// Past appointments move to history automatically.
function settleVisits() {
  const now = new Date();
  visits.forEach(v => {
    if (v.status === 'upcoming' && visitStart(v) < now) v.status = 'completed';
  });
}

/* ---------- Phone lookup ---------- */
function setPhone(key) {
  currentPhone = key;
  store.set('ab_phone', key);
  renderVisits();
}

function renderLookup() {
  $('lookup').hidden = !!currentPhone;
  $('recordsBody').hidden = !currentPhone;
  $('accountPhone').textContent = formatPhone(currentPhone);
}

$('lookup').addEventListener('submit', e => {
  e.preventDefault();
  const input = $('lookupPhone');
  if (!validate(input)) { input.focus(); return; }
  // Front end only: with a backend, send a one-time SMS code here and verify it before showing records.
  const key = phoneKey(input.value);
  setPhone(key);
  const found = mine().length;
  toast(found ? `Found ${found} visit${found > 1 ? 's' : ''} for ${formatPhone(key)}.` : `No visits yet for ${formatPhone(key)}. Book one and it shows up here.`);
});
$('lookupPhone').addEventListener('input', e => {
  if (e.target.closest('.field').classList.contains('is-invalid')) validate(e.target);
});

$('changePhone').addEventListener('click', () => {
  setPhone('');
  $('lookupPhone').value = '';
  $('fName').value = '';
  $('fPhone').value = '';
  $('lookupPhone').focus();
});

// Typing a known number in the booking form recognises a returning customer.
$('fPhone').addEventListener('change', () => {
  const key = phoneKey($('fPhone').value);
  if (key.length === 10 && key !== currentPhone && visits.some(v => phoneKey(v.phone) === key)) {
    setPhone(key);
    toast('Welcome back. Your usual and rewards are ready.');
  }
});

let nextDue = null;

function renderRewards() {
  const { available, onCard } = rewardState();
  // A card with an unused reward stays full until the free cut is booked.
  const shown = available > 0 ? REWARD_EVERY : onCard;
  $('stamps').innerHTML = Array.from({ length: REWARD_EVERY }, (_, i) => {
    const last = i === REWARD_EVERY - 1;
    const filled = i < shown;
    return `<li class="stamp${filled ? ' is-filled' : ''}${last ? ' is-free' : ''}" aria-label="Stamp ${i + 1}${filled ? ', earned' : ''}${last ? ', free haircut' : ''}">
      <i class="ph-${filled ? 'fill' : 'light'} ${last ? 'ph-gift' : 'ph-scissors'}" aria-hidden="true"></i></li>`;
  }).join('');
  const left = REWARD_EVERY - onCard;
  $('rewardText').textContent = available > 0
    ? `You have ${available} free haircut${available > 1 ? 's' : ''} ready. Tick "Use my free haircut reward" when you book.`
    : `${onCard} of ${REWARD_EVERY} stamps. ${left} more haircut${left > 1 ? 's' : ''} until your next one is free.`;
  $('rewards').classList.toggle('has-reward', available > 0);
}

function renderVisits() {
  settleVisits();
  const byDate = (a, b) => visitStart(a) - visitStart(b);
  renderLookup();
  const list_ = mine();
  const own = list_.filter(v => !v.guestOf);
  const upcoming = list_.filter(v => v.status === 'upcoming').sort(byDate);
  const history = list_.filter(v => v.status !== 'upcoming').sort(byDate).reverse();
  const ownUpcoming = upcoming.filter(v => !v.guestOf);
  const ownCompleted = history.filter(v => v.status === 'completed' && !v.guestOf);

  $('cUpcoming').textContent = upcoming.length;
  $('cHistory').textContent = history.length;
  $('navBadge').hidden = upcoming.length === 0;
  $('navBadge').textContent = upcoming.length;

  // Stats (your own visits only, not guests)
  $('sTotal').textContent = ownCompleted.length;
  const last = ownCompleted[0];
  $('sLast').textContent = last ? `${fmtDate(last.date)}, ${service(last.service).name}` : 'None yet';
  nextDue = null;
  if (ownUpcoming[0]) {
    $('sDue').textContent = `Booked for ${fmtDate(ownUpcoming[0].date)}`;
  } else if (last) {
    nextDue = new Date(last.date + 'T00:00');
    nextDue.setDate(nextDue.getDate() + service(last.service).every * 7);
    $('sDue').textContent = nextDue < new Date() ? 'Due now' : fmtDate(toISO(nextDue));
  } else {
    $('sDue').textContent = 'Book your first visit';
  }
  $('remindBtn').hidden = !nextDue || nextDue < new Date();

  const counts = {};
  own.filter(v => v.status !== 'cancelled').forEach(v => { counts[v.service] = (counts[v.service] || 0) + 1; });
  const fav = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  $('sFav').textContent = fav ? service(fav[0]).name : 'None yet';

  renderRewards();
  renderRewardToggle();
  renderUsual();
  renderHighlights();

  // List
  const list = activeTab === 'upcoming' ? upcoming : history;
  if (!list.length) {
    $('visitList').innerHTML = `
      <div class="empty">
        <i class="ph-light ${activeTab === 'upcoming' ? 'ph-calendar-blank' : 'ph-clock-counter-clockwise'}" aria-hidden="true"></i>
        <p>${activeTab === 'upcoming' ? 'No upcoming visits.' : 'No past visits yet. Completed cuts show up here with your notes.'}</p>
        <a href="#book" class="btn btn--outline btn--sm">Book a chair</a>
      </div>`;
    return;
  }

  $('visitList').innerHTML = list.map(v => {
    const s = service(v.service), b = barber(v.barber);
    const statusLabel = { upcoming: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' }[v.status];
    const tags = [
      v.guestOf ? `<span class="status">For ${esc(v.name)}</span>` : '',
      v.reward ? '<span class="status status--reward">Free reward</span>' : '',
    ].join('');
    const actions = v.status === 'upcoming'
      ? `<button type="button" class="btn btn--outline btn--sm" data-calendar><i class="ph-light ph-calendar-plus" aria-hidden="true"></i> Add to calendar</button>
         <button type="button" class="btn btn--outline btn--sm" data-cancel>Cancel</button>`
      : `<button type="button" class="btn btn--primary btn--sm" data-rebook>Book again</button>`;
    return `
      <article class="visit-card is-${v.status}" data-id="${v.id}">
        <div class="visit-card__date">
          <span>${fmtDate(v.date, { month: 'short' })}</span>
          <strong>${fmtDate(v.date, { day: 'numeric' })}</strong>
        </div>
        <div class="visit-card__main">
          <h3>${s.name} <span class="status">${statusLabel}</span>${tags}</h3>
          <p>${fmtDate(v.date, { weekday: 'long' })} at ${v.time} with ${b.name}. ${v.price === 0 ? 'Free' : money(v.price)}</p>
          <label class="visit-card__notes">
            <span>Cut notes</span>
            <input type="text" value="${esc(v.notes || '')}" placeholder="Add guard lengths or what you liked" data-notes>
          </label>
        </div>
        <div class="visit-card__actions">${actions}</div>
      </article>`;
  }).join('');
}

$('remindBtn').addEventListener('click', () => {
  if (!nextDue) return;
  downloadIcs(`haircut-due-${toISO(nextDue)}.ics`, {
    uid: `due-${toISO(nextDue)}`, start: nextDue, allDay: true,
    title: 'Time for a fresh cut',
    description: `Your next cut is due. Book your usual at ${SHOP.name}.`,
  });
  toast('Reminder downloaded. Open it to add it to your calendar.');
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach(t => {
      t.classList.toggle('is-active', t === tab);
      t.setAttribute('aria-selected', t === tab);
    });
    renderVisits();
  });
});

$('visitList').addEventListener('click', e => {
  const card = e.target.closest('.visit-card');
  if (!card) return;
  const v = visits.find(x => x.id === card.dataset.id);
  if (e.target.closest('[data-cancel]')) {
    v.status = 'cancelled';
    saveVisits();
    fillTimes();
    toast('Visit cancelled.');
  }
  if (e.target.closest('[data-rebook]')) prefillBooking(v.service, v.barber, v.notes);
  if (e.target.closest('[data-calendar]')) visitToCalendar(v);
});

$('visitList').addEventListener('change', e => {
  if (!e.target.matches('[data-notes]')) return;
  const v = visits.find(x => x.id === e.target.closest('.visit-card').dataset.id);
  v.notes = e.target.value.trim();
  store.set('ab_visits', visits);
  toast('Cut notes saved.');
});

/* =========================================================
   Page chrome: nav, menu, reveal, reviews, hours
   ========================================================= */
$('year').textContent = new Date().getFullYear();

const nav = $('nav');
const hero = document.querySelector('.hero');
new IntersectionObserver(([entry]) => {
  nav.classList.toggle('is-solid', !entry.isIntersecting);
  hero.classList.toggle('is-offscreen', !entry.isIntersecting); // the pole rests while nobody can see it
}, { rootMargin: '-72px 0px 0px 0px', threshold: 0.12 }).observe(hero);

// Phone and tablet menu: a full-height sheet, the booking button pinned at the bottom.
const toggle = $('navToggle');
const links = $('navLinks');
function setMenu(open) {
  links.classList.toggle('is-open', open);
  document.documentElement.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  toggle.innerHTML = `<i class="ph-light ${open ? 'ph-x' : 'ph-list'}" aria-hidden="true"></i>`;
}
toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => {
  if (e.key === 'Escape' && links.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
});
matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

// Mark the nav link for the section in the middle of the screen.
const navLinksBySection = new Map([...links.querySelectorAll('a[href^="#"]:not(.btn)')]
  .map(a => [a.getAttribute('href').slice(1), a]));
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinksBySection.forEach(a => a.removeAttribute('aria-current'));
    navLinksBySection.get(entry.target.id)?.setAttribute('aria-current', 'true');
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main > section').forEach(s => spy.observe(s));

/* ---------- Reveal: blocks below the fold arrive in sequence, once ----------
   Only what starts below the fold is hidden, so nothing on screen blinks; with no
   script, or with reduced motion, nothing is hidden at all. */
const REVEAL = [
  '.head .eyebrow', '.head h2', '.head > .lead', '.proof__list > div',
  '.hl', '.hl__media', '.menu__group', '.signature', '.signature__media', '.quiz', '.result',
  '.member', '.member__media', '.bento > .media', '.reviews__inner', '.extra',
  '.book__form > .eyebrow', '.book__form > h2', '.book__form > .lead', '.visit > *', '.lookup', '.claim__card',
].join(', ');

function reveal(el) {
  if (!el.classList.contains('is-pending')) return;
  el.classList.replace('is-pending', 'is-in');
  revealIO.unobserve(el);
  if (el.classList.contains('menu__group')) { menuSeen = true; el.querySelectorAll('dd').forEach(rollPrice); }
  // hand the final state back to CSS so hovers keep their own timing
  setTimeout(() => { el.classList.remove('is-in'); el.style.removeProperty('--d'); }, 1400);
}
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
}, { rootMargin: '0px 0px -8% 0px' });

function setupReveal() {
  if (reducedMotion) { menuSeen = true; return; }
  const fold = innerHeight * 0.94;
  const pending = [...document.querySelectorAll(REVEAL)].filter(el => el.getBoundingClientRect().top > fold);
  pending.forEach(el => {
    el.classList.add('is-pending');
    if (el.classList.contains('eyebrow')) el.style.setProperty('--chars', Math.max(8, el.textContent.trim().length));
    const row = [...el.parentElement.children].filter(c => pending.includes(c));
    const i = row.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 5) * 90}ms`);
    revealIO.observe(el);
  });
  if (!document.querySelector('.menu__group.is-pending')) menuSeen = true;
  // the observer is never the only path: a sweep on scroll catches anything it missed
  const sweep = () => document.querySelectorAll('.is-pending').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.94 && r.bottom > 0) reveal(el);
  });
  addEventListener('scroll', () => requestAnimationFrame(sweep), { passive: true });
  addEventListener('resize', sweep);
}

// Numbers in the at-a-glance strip count up one step at a time when they arrive.
function setupCounters() {
  const counters = [...document.querySelectorAll('[data-count]')]
    .filter(el => !reducedMotion && el.getBoundingClientRect().top > innerHeight * 0.94);
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    io.unobserve(entry.target);
    const el = entry.target, target = Number(el.dataset.count);
    let n = 0;
    const tick = () => { el.textContent = String(++n); if (n < target) setTimeout(tick, 380 / target); };
    setTimeout(tick, 200);
  }), { rootMargin: '0px 0px -8% 0px' });
  counters.forEach(el => { el.textContent = '0'; io.observe(el); });
}

const mobileCta = document.querySelector('.mobile-cta');
const ctaHiddenBy = new Set();
const ctaObserver = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting ? ctaHiddenBy.add(e.target) : ctaHiddenBy.delete(e.target));
  mobileCta.classList.toggle('is-hidden', ctaHiddenBy.size > 0);
});
ctaObserver.observe(hero);
ctaObserver.observe($('book'));

document.querySelectorAll('.hours tbody tr')[(new Date().getDay() + 6) % 7]?.classList.add('is-today');

const quotes = [...document.querySelectorAll('.quote')];
let currentQuote = 0;
function showQuote(i) {
  quotes[currentQuote].classList.remove('is-active');
  currentQuote = (i + quotes.length) % quotes.length;
  quotes[currentQuote].classList.add('is-active');
  $('quoteCount').textContent = `${currentQuote + 1} / ${quotes.length}`;
}
$('prevQuote').addEventListener('click', () => showQuote(currentQuote - 1));
$('nextQuote').addEventListener('click', () => showQuote(currentQuote + 1));

/* ---------- Init ---------- */
renderBarberOptions();
renderOpenStatus();
setInterval(renderOpenStatus, 60000); // the shop opens and closes while the page is open
refreshPrices();
fillTimes();
store.set('ab_visits', visits);
setupReveal();
setupCounters();
