# Automatebarber.ai: design PRD

Built with the Ground Standard website builder, 22 October 2026. This is an **enhancement of
an existing one-page system**, not a new site: every section, feature and line of copy stays
as it was. What changed is the design, the photography, the price data and the logo.

## 1. The business in one paragraph

Automatebarber.ai is a modern American barbershop whose website is also its front desk:
customers book a chair in seconds, look up every past visit by phone number, collect a
stamp toward a free eighth haircut, get a style recommendation from four questions, and see
prices that the staff update live. Four barbers, nine services, open seven days.

## 2. Who the site is for

- **The regular** who knows what they want: needs "Book a chair" and "your usual" within
  ten seconds, on a phone.
- **The first-timer** comparing shops: needs real prices, real photos of the work and the
  people, and proof the shop is open.
- **The unsure** customer: needs the style consult to tell them what to ask for.

## 3. Design direction

- **Concept:** *The shop that remembers.* Barbering craft, kept like a well-run ledger.
- **The feeling:** warm, precise, quietly premium. Not gold-and-black luxury cliché, not
  neon tech, not hipster-vintage (no skulls, no moustache icons).
- **Why:** the product is memory and precision (every cut recorded, every price live), so
  the design pairs a craftsman's serif with a machine's mono, and the motion behaves like a
  mechanism, not a mood.

## 4. Design signature

| Element | Decision |
|---|---|
| Palette strategy | Warm espresso ground `#120E0B` with bone ink `#F2ECE2`; one brass accent `#D2A86A` on things you can click and nothing else; one paper band `#EFE8DC` for the price menu |
| Accent | Brass `#D2A86A` (deep brass `#7E5A28` on paper, 5.1:1) |
| Type pairing | Instrument Serif for display (h1, h2, prices on the board, big numbers, one italic phrase per headline) · Geist for text and interface · Geist Mono for labels, times and buttons |
| Type scale contrast | Very high in the hero only (display ≈ 7× body); moderate below, with real mid steps |
| Section rhythm | Dark sections divided by hairline rules; one paper band (the menu); one full-bleed photograph band (reviews) |
| Hero composition | One full-bleed photograph settling slowly; headline huge on two designed lines, bottom-left, second line italic; a turning barber pole at the right edge; live open status under the actions |
| Imagery treatment | Real photography only, under one "tobacco" grade (brown at 34% in colour blend mode) so photos from different shoots read as one shop; colour returns on hover |
| Edge and corner language | 0px, razor edges and hairline rules |
| Motion character | **Mechanical**: linear and stepped. The pole turns linearly; labels type in on `steps()`; numbers count one step at a time; prices roll like a counter; grids arrive in sequence. Nothing bounces, everything off under reduced motion |
| Logo placement | Left, mark and wordmark on one line; stacked lockup centred in the footer |
| Opening style | Full-bleed single photograph plus the pole (no crossfade loop: the pole is the page's one perpetual animation) |
| Header variant | B: logo left, everything right; transparent over the hero, solid espresso once scrolled; full-height sheet under 1100px with the booking button pinned at the bottom |
| Footer variant | D: one centred column (stacked logo, address and phone, links, socials), bottom bar with © and the Ground Standard credit |
| Alignment system | Split section heads: numbered mono eyebrow and a two-line serif headline on the left (1.15fr), one sentence on the right (0.85fr) on the headline's baseline; content left-aligned beneath |
| Container | 1240px page, 46ch leads, 65ch prose |
| Signature moment | **The barber pole turns only while the shop is actually open**, read from the same hours as the booking form. Closed, it stops and dims, and the status says when it opens |
| Detail set | Section number `§01` with a rule as the eyebrow mark · dotted leaders on the price board · underline that grows from the left · square 0px buttons in mono caps · brass 2px focus ring, 3px offset · no accordion (none on the page) |

### Checked for uniqueness

Compared against every site the builder has shipped: no more than one of the signature elements above matches any of them. The mechanical motion character, header B and footer D had not been used before.

## 5. References and what we take from each

Eight independent US barbershop sites, captured in a real browser on 22 Oct 2026 and looked
at screen by screen (screenshots kept with the build notes). Principles, never layouts.

| Reference | The one principle | Taken here | Not copied |
|---|---|---|---|
| Fellow Barber (NYC/LA/SF), fellowbarber.com | The header has exactly one filled element, "Book now", on every page | Brass "Book a chair" is the only filled thing in the bar | Their first screen never says what or where the business is |
| Rosemont Barbers (Denver), therosemontbarbers.com | A colour role system: brass marks everything you can click | Brass is reserved for actions; labels, icons and stamps use bone | Prices hidden in accordions; a policies H2 straight after the hero |
| Church Barber (San Francisco), churchcalifornia.com | One treatment over every photo turns mixed shots into one lookbook | The tobacco grade over every photograph | Barbershop buried inside a retail store; no name or hours in the hero |
| Bolt Barbers (DTLA), boltbarbers.com | The whole menu on the home page, name left and price right; a full-width Book bar pinned to the bottom of the phone | The paper price board; the bottom booking bar on phones | Hero video and copy that alienate half the market |
| SHED Barber (Austin), shedbarber.com | Each barber card ends in a "Book with [name]" deep link | "Book with Marcus" on every barber card, wired to the booking form | Newsletter modal over the hero; prices spelled out in words |
| Neighborhood Cut & Shave (NYC/Greenville), neighborhoodcutandshave.com | One clear answer for the customer who doesn't know what to book | Already in the system as the style consult; kept prominent at §03 | Headlines set as images |
| Persons of Interest (Brooklyn), personsofinterestbklyn.com | Prices stated as "taxes included" ranges on hairlines | Hairline and dotted-leader rhythm on the menu | Hamburger-only nav on desktop; a home page with no information |
| Birds Barbershop (Austin), birdsbarbershop.com | Each core service shown on a real person with a plain-language rule | Real people in every photograph | An eight-colour palette; a location modal before every booking |

**What none of them do, and this system already does:** price, duration and what's
included scannable on one line; a live open/closed status; your own visit history and
rewards; a recommendation of cut, service and barber. The design leans on those.

## 6. Sitemap

| Page | Path | Job |
|---|---|---|
| Home (the whole system) | `/` | Book, track, compare, consult. Sections §01 to §08 unchanged |
| Not found | `/404.html` | Branded; links to Book a chair, Prices, My visits |

The page carries 11 sections against the builder's six-to-nine guideline. That is the
existing content, which this enhancement was asked to keep. If the site grows, the natural
split is `/book` and `/my-visits` as their own pages, with Home routing to them (house rule 3).

## 7. Page-by-page content plan

Copy: unchanged from the existing system. New words are labels only: section eyebrows
(`§01 Online services` …), "Modern American barbershop" (from the meta description), the
at-a-glance strip (four facts already stated on the page: 4 barbers, 7 days, 8th cut free,
2-hour free cancellation) and the 404 page.

Photography: all eleven AI-generated images replaced with real photographs (see §9).

## 8. Navigation

Top: Online services · Prices · Style consult · Barbers · My visits · **Book a chair**.
Footer: Prices · Style consult · My visits · Book a chair · Staff: update prices; socials.
Nothing is duplicated between them beyond the booking action.

## 9. Facts to lock

| Fact | Status | Source |
|---|---|---|
| Prices | **Locked** to US market medians: cut $50, fade $55, kids $35, senior/military $45, hot towel shave $50, beard $30, line-up $25, head shave $45, The Full Service $110 | 15 independent shops, read 22 Oct 2026: [pricing-research.md](pricing-research.md) |
| Durations, rebook intervals | Kept; all inside the observed US ranges | same |
| Hours | Kept (71 a week: realistic for a busy urban shop, on the long side) | same |
| Address, phone, email | **Placeholder** (123 Main Street, Your City, ST 00000 · (555) 123-4567) | carried over from the system |
| Instagram, TikTok, Google links | **Placeholder** (`#`) | carried over |
| Legal entity, governing state | **Unknown**: needed for Privacy Policy and Terms | — |
| Domain | Assumed `automatebarber.ai` (from the email address) in canonical, Open Graph, sitemap and JSON-LD | confirm |

### Photography: real, licensed, credited

Every photograph is a real camera photo from Pexels (Pexels License) or Unsplash (Unsplash
License, no Unsplash+), free for commercial use with no attribution required; credited here
anyway. Each was opened and checked before use. Logos of other real businesses were blurred
where they appeared.

| File | Photographer | Source |
|---|---|---|
| hero.jpg, hero-mobile.jpg, og.jpg | Antoni Shkraba | [Pexels 4625629](https://www.pexels.com/photo/photo-of-a-man-getting-a-haircut-4625629/) |
| interior.jpg | Nathon Oski | [Unsplash EW_rqoSdDes](https://unsplash.com/photos/EW_rqoSdDes) |
| consult.jpg | Ali Aliev | [Pexels 12074386](https://www.pexels.com/photo/back-view-of-man-with-black-hair-12074386/) |
| fade.jpg | Brian Silva | [Pexels 39559262](https://www.pexels.com/photo/man-getting-modern-haircut-at-barbershop-39559262/) |
| taper.jpg | Dmitry Zvolskiy | [Pexels 1805600](https://www.pexels.com/photo/man-cutting-the-hair-on-the-person-sitting-on-the-chair-1805600/) |
| beard.jpg (cape logo blurred) | César Badilla Miranda | [Unsplash t34TLxxmwws](https://unsplash.com/photos/t34TLxxmwws) |
| tools.jpg | RDNE Stock project | [Pexels 7697712](https://www.pexels.com/photo/tools-at-barbershop-7697712/) |
| shave.jpg (shirt logo blurred) | Mitchell Orr | [Unsplash iDbTDUzQTxY](https://unsplash.com/photos/iDbTDUzQTxY) |
| barber-marcus.jpg | Sephina Cornwall | [Pexels 32351046](https://www.pexels.com/photo/barber-skillfully-trimming-client-s-hair-in-salon-32351046/) |
| barber-dre.jpg | Th2city Santana | [Pexels 1836983](https://www.pexels.com/photo/barber-cutting-man-s-hair-1836983/) |
| barber-tony.jpg (shop sign blurred) | Tim Mossholder | [Pexels 3105409](https://www.pexels.com/photo/barber-cutting-man-s-hair-3105409/) |
| barber-sam.jpg | Taylor Smith | [Unsplash eYllF8RK4yo](https://unsplash.com/photos/eYllF8RK4yo) |
| storefront.jpg | Julien Orliac | [Unsplash gzobGDzh4ww](https://unsplash.com/photos/gzobGDzh4ww) |
| bg-consult.jpg | Reza Ghaemi | [Unsplash 5P-eClxMg1s](https://unsplash.com/photos/5P-eClxMg1s) |
| bg-extras.jpg | Kawê Rodrigues | [Unsplash iGf2nAz7QZg](https://unsplash.com/photos/iGf2nAz7QZg) |
| bg-reviews.jpg | Allef Vinicius | [Unsplash IvQeAVeJULw](https://unsplash.com/photos/IvQeAVeJULw) |
| bg-menu.jpg | Nikolaos Dimou | [Pexels 1319459](https://www.pexels.com/photo/gray-hand-tool-1319459/) |
| bg-footer.jpg | Luis Quintero | [Unsplash ia5aE4JL8_A](https://unsplash.com/photos/ia5aE4JL8_A) |

### Launch tasks (before this goes in front of customers)

1. **Swap the four barber portraits for the shop's real staff.** They are stock photographs of
   real people standing in for Marcus, Andre, Tony and Sam.
2. Real address, phone, email and social links (the socials are `#` today; remove any the shop
   does not have).
3. Privacy Policy and Terms of Use, linked in the footer: the booking form collects names and
   phone numbers. Needs the legal entity and governing state.
4. Confirm the domain, then serve `404.html` for unknown paths on the host.
5. Connect a real backend: bookings, records and staff prices still live in each visitor's
   browser (localStorage), and "open now" reads the visitor's clock, not the shop's time zone.

## 10. Out of scope

A backend (bookings, SMS, records and prices still live in the browser's localStorage), a
real address, phone, socials and legal pages (placeholders, see launch tasks), and
publishing to a domain.
