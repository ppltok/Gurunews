# Outbid.lol: Teardown, Architecture, and a Non-English Launch Plan (KR / FR / SE)

*Research compiled 29 August 2026. All external facts are cited inline; where sources
conflict I say so rather than picking a winner.*

---

## Part 0 — Executive summary

**What happened.** On 19 August 2026 a 29-year-old German developer, **Jonathan Wilke**,
shipped `outbid.lol` — a single-page leaderboard where your rank is literally the number of
dollars you have paid. He built it in roughly **three hours**, using **Grok (4.6) inside
Cursor**, on top of **his own SaaS boilerplate, supastarter**. He posted it on X the next
day with no paid promotion. Seven days later it had done **~$235,000 in revenue on ~1.36M
visits**, spawned **190+ clones**, and drawn a **$100k acquisition offer** on day one.

**Why it worked.** The product is not the moat. The mechanic is a database table and a sort
order — copyable in an afternoon, and 190 people proved it. What could not be copied was
Wilke's **launch reach**: an existing X audience built over years of shipping supastarter,
firing a perfectly screenshot-shaped object into the indie-hacker timeline at the right
moment. Distribution beat product, completely.

**The opportunity being asked about.** Replicate the *pattern* — not the clone — in
**South Korea, France, and Sweden**, as a **primary-language** product: Korean-first,
French-first, Swedish-first, with local payment rails, local social proof, and local
compliance. The AI-coding-tool boom in these markets (Claude Code's explosive Korean
adoption, Codex's 5M WAU, Grok Build's arrival) is the *supply of bidders*: hundreds of
thousands of developers and AI-tool companies with marketing budgets and no local
attention marketplace to spend them in.

**My honest reservation, stated once.** Pay-to-rank boards went from novel to saturated in
seven days. A localized clone launched in month two of the fad, in a smaller market, is
structurally a worse bet than the original was — the mechanic is now familiar, and novelty
was 80% of the original's fuel. The plan below is therefore built to survive that: it treats
the board as a **wedge for a durable local product-discovery property**, not as a lottery
ticket, and it has explicit kill criteria. Everything the request asked for is delivered in
full; the sequencing recommendation (Korea first, France second, Sweden as a cheap probe)
is mine and is flagged as a judgment call.

---

# Part 1 — The Outbid.lol teardown

## 1.1 What it actually is

A public leaderboard. You submit a product link or an X handle, you pay, and your position
is determined by one rule: **rank = total dollars spent**. Whoever pays more than you takes
your slot. No algorithm, no editorial, no login wall, no AI, no ads, no revenue share.

Entry pricing is reported inconsistently across coverage — most write-ups say bidding
**starts at $5**, while several headlines frame it as "the $1 site," which refers to the
*increment* (pay one dollar more than the current leader to pass them). Both descriptions
appear in reputable coverage; treat "$5 floor, $1 increment" as the working model.

The About/Rules pages confirm the deliberate crudeness: payments are **non-refundable**,
there is **no moderation queue**, and the only content rule is a ban on porn / NSFW / adult
platforms.

## 1.2 Who built it

**Jonathan Wilke**, 29, independent developer based in Germany. His day business is
**supastarter** — a commercial SaaS starter kit for Next.js, Nuxt, and TanStack Start, used
by 600+ developers. That matters twice over: it gave him the **code** (a production-grade
boilerplate he wrote himself and knows cold) and the **audience** (years of building in
public to a developer following on X).

This is the single most under-reported fact in the coverage. The three-hour build is the
headline; the three-year audience is the actual asset.

## 1.3 How he built it — the process

| Element | Detail |
|---|---|
| Build time | ~3 hours, in one sitting |
| AI tooling | **Grok 4.6 running inside Cursor** — per the founder, "100% built with Grok 4.6 in Cursor while cooking dinner" |
| Starting point | **supastarter** boilerplate (his own product), not a blank repo |
| Launch time | 23:08 CEST, 19 August 2026 |
| Public launch | Posted to his X profile, 20 August 2026, **no paid promotion** |

The AI-assisted part is real but should be read correctly: Grok-in-Cursor wrote a *thin
feature* on top of a *pre-existing, battle-tested skeleton* that already had auth, payments,
database, and deploy wired up. The 3-hour number is a boilerplate story at least as much as
an AI story.

## 1.4 The architecture and software stack

### Confirmed / high-confidence

| Layer | Technology | Confidence |
|---|---|---|
| Framework | **Next.js** (React, TypeScript) | High — detected in scans, stated in coverage |
| Hosting | **Vercel** (serverless functions + edge CDN) | High — detected |
| Database | **PostgreSQL** | High — stated; supastarter's default |
| ORM | **Prisma or Drizzle** (supastarter ships both; which one he chose isn't public) | Medium |
| API layer | **Hono.js + oRPC**, TanStack Query on the client | Medium — supastarter default, not independently confirmed for outbid |
| Auth | **Better Auth**, Google sign-in (buyers "sign in later with the same Google email used at checkout") | Medium-High |
| Styling | Tailwind CSS + Radix UI | Medium — supastarter default |
| Payments | **Polar as merchant of record**; Stripe-hosted checkout also referenced | **Conflicting — see below** |
| Domain | `outbid.lol` — .LOL gTLD, registry **XYZ.COM**, backend Hexonet. Registration is ~$1–3/yr promotional, ~$16/yr renewal | High |
| Analytics | Unnamed provider that **broke under load and was swapped overnight** | High |
| Meta | Open Graph + Twitter Cards (the screenshot-shareability layer) | High |

### The payments discrepancy — worth resolving before you copy it

Coverage splits. The most technically detailed write-up says cross-border payment processing
and sales-tax compliance were solved by using **Polar as merchant of record**, and describes
heavy transactional work being delegated to "Polar and Postgres." Other write-ups (and
several clone sites, which are *not* evidence about the original) describe **Stripe-hosted
checkout**. supastarter ships integrations for both — and for five payment providers total —
so either is plausible and he may well use Stripe *through* Polar.

**Why this is the most important architectural decision in the whole build:** a merchant of
record takes on the seller-of-record role, meaning **Polar owns the VAT/GST/sales-tax
liability across every jurisdiction the bids came from**. A solo German developer taking
$235k in small payments from buyers in dozens of countries in seven days, without an MoR,
would have created a genuinely dangerous tax-registration problem. The MoR is what made
"solo founder, no ops team, global revenue in 48 hours" survivable, not just convenient.

### One detection to discard

An automated tech scan lists **"Rivo — Shopify loyalty and rewards platform"** among 11
detected tools. This is almost certainly a **false positive** (fingerprint collision or a
stale scan); there is no Shopify surface on a Next.js/Vercel one-pager and no corroboration
anywhere in the coverage. Flagged so nobody rebuilds a phantom dependency.

### Why the architecture survived 1M+ visitors

The system that had to stay up under viral load is, in full:

1. **One table** (entries: link, label, total paid, timestamp).
2. **One sort order** (`ORDER BY total_paid DESC`).
3. **One write path** (payment webhook → increment total → invalidate cache).

There is no AI inference call on the request path, no personalization, no moderation queue,
no recommendation engine, no per-user state beyond what checkout requires. The read path is
a cacheable, identical-for-everyone page served from Vercel's edge; the write path is
low-volume (hundreds of payments, not millions) and handled by the payment provider's
infrastructure. **The only thing that actually broke was the third-party analytics vendor** —
i.e. the one component that had to process every single pageview in real time.

That is the architecture lesson, and it generalizes: *the viral component must be a static
document; everything stateful must be low-volume; anything that touches every pageview is
your first outage.*

## 1.5 The launch and the numbers

| Time from launch | Metric |
|---|---|
| Launch | 19 Aug 2026, 23:08 CEST; posted to X 20 Aug |
| +12 hours | 10,000+ visitors; four-figure bids from funded startups and indie devs |
| +36 hours | **1,000,000+ visitors**; analytics provider broke and was replaced; **$100k acquisition offer**; 10+ clones live |
| 22 Aug | 1,147,442 visitors · **$132,263** revenue · top bid **$14,013** |
| +65 hours | $139,041 |
| +77 hours | **$178,000** · 100+ clones |
| 5 days | **$220,000** |
| 7 days | **$235,153** on **1.36M visits** · **190+ clones** |

Cost side: a domain (~$1–16), Vercel hobby/pro, a Postgres instance, and payment fees. Gross
margin is effectively the payment-processing take rate. This is close to a pure-margin
business.

### The clone wave — the real finding

Within 24 hours the mechanic was replicated with variations: reverse auctions (lowest bid
wins), boards ranking other boards, personal-status boards. Over **500 .LOL domains** were
registered riffing on pay-to-rank. `.lol` **out-registered `.com`** for "bid" keywords (806
vs 760) — reportedly the first time a novelty extension beat .com on a live vocabulary. There
are now *directories of the clones* (`outoutbid.lol`, `outbid-directory.lol`, `lolhub.lol`).

**Almost all of them captured a rounding error of the original's traffic.** The mechanic
transferred; the audience did not. Internationalized variants did emerge and are the closest
precedent for the plan in Part 3: **Destaque.lol** (Brazil, BRL, showing total paid + clicks
+ cost-per-click), **maiorlance.com** (Brazilian Instagram-profile ranking settled via Pix),
and **WhoDeyTop.lol** (Ghana, bids in cedis). Notably these succeeded *as local-currency,
local-language, local-payment-rail products* — not as English clones. That is the strongest
available evidence for the strategy in Part 3.

## 1.6 Risk profile the original carried (and mostly ignored)

- **Non-refundable payments + no moderation** is a chargeback and complaint surface. Survivable
  at $235k over a week with an MoR absorbing it; not survivable as an ongoing business in the EU.
- **Paid ranking with no disclosure** is a regulated activity in the EU and Korea (Part 3.4).
- **Novelty decay.** Revenue growth flattened hard between day 5 ($220k) and day 7 ($235k) —
  roughly $15k in the final two days against $132k in the first three. The curve had already
  bent by the time most people heard about it.

---

# Part 2 — AI coding tools in non-English markets

This section establishes *who the bidders are*. The buyers on a board like this are AI-tool
companies, dev-tool startups, and indie makers with marketing budget. So the question "is
there a market in Korea/France/Sweden" is really "how deep is the AI-developer economy there."

## 2.1 South Korea — the standout, by a distance

Korea is not a "non-English market to eventually expand into." It is, right now, one of the
most intense AI-coding markets on earth.

- **April 2026: Claude overtook ChatGPT in South Korea's paid generative-AI market** — the
  first country where that happened.
- **Claude's weekly MAU in Korea grew ~6× in four months.**
- Korea scores **3.12× on Anthropic's Claude usage index** (usage relative to working-age
  population) — top tier globally, alongside Israel and Singapore. ~**556,700 Claude users**.
- **More than a quarter of Claude Code's entire user base is now Asia-Pacific.**
- **June 2026: the largest Claude Code enterprise commitment in Asia** — NAVER (the single
  largest adopter in Asia, thousands of engineers), Samsung SDS, LG CNS, Nexon, Hanwha
  Solutions, Channel Corp. Tens of thousands of engineers.
- **Anthropic opened its Seoul office on 17 June 2026** — its third in APAC.
- Korean enterprises are running **dual-stack** (ChatGPT *and* Claude Code together) rather
  than picking one — meaning two vendor ecosystems competing for the same developers'
  attention, which is exactly the condition that creates ad spend.

**The localization gap is real and documented.** Claude Code's CLI **has no UI
internationalization** — menus, prompts, help text remain English-only, with open feature
requests for i18n/l10n. There are logged bugs where Claude Code **switches output from Korean
to Japanese mid-response** despite Korean being explicitly set. So: the most-adopted AI coding
tool in the most enthusiastic market **does not speak the local language in its own
interface**. That is the wedge for a Korean-first property.

## 2.2 OpenAI Codex — huge, but geographically opaque

- **5M+ weekly active users** by June 2026.
- **~20% are non-developers** (legal, finance, recruiting, marketing, ops), adopting **3×
  faster than engineers**; non-developer growth of 137× (individual) and 189× (org) since
  Aug 2025.
- Product surface expanded well beyond coding: **Sites** (hosted shareable web apps),
  **Annotations**, and six role plugins aggregating 62 business apps.

**Caveat I could not close:** no public country-level breakdown for Codex exists in the
sources I could reach. Treat Codex's non-English penetration as *unquantified*, not as
*absent*. The non-developer expansion is strategically relevant though — it widens the buyer
pool for any local discovery board well past engineers.

## 2.3 Grok / xAI — the tool that built the thing, and a genuine force

- **Grok Code Fast 1** (launched Aug 2025, refined with Cursor as a launch partner): 70.8% on
  SWE-Bench Verified, **$0.20 per million input tokens**, 256K context.
- It reportedly holds **~57.6% of all tokens used in the "Programming" category** on
  aggregate-routing measurements. Read that as *token share on routing platforms*, not total
  market share — but the direction is unambiguous: developers chose speed and price over a
  few benchmark points.
- **Grok 4.5** — a Cursor-trained coding model at ~$2/M input tokens.
- **Grok Build** — early-beta coding agent and CLI for professional software engineering,
  launched May 2026.
- **SpaceX acquired Cursor (~$60B)**; Cursor is used daily by ~7M developers. Composer 2.5
  shipped May 2026.
- **90% of developers now use at least one AI tool at work** (JetBrains, Jan 2026).

## 2.4 France and Sweden — sizeable, under-served, and quieter

| | France | Sweden |
|---|---|---|
| Software developers | ~**533,000** (3rd in Europe) | ~**179,000** (top-10 in Europe) |
| Consumer AI adoption | **>40%** | **~35%** |
| Enterprise AI adoption | **10.4%** | **25.0%** |
| Claude position | Top-20 globally per capita; **~3% of all Claude web traffic** | No per-country index figure found |

The France numbers contain the most interesting anomaly on this page: **high consumer
adoption (>40%) against low enterprise adoption (10.4%)**. That is a market full of
individual developers and small makers using AI tools personally, ahead of their employers —
precisely the indie-hacker demographic that bid on outbid.lol. Sweden is the mirror image:
**enterprise-led (25%), consumer-lighter (35%)**, smaller, and with very high English
proficiency — which cuts both ways (easy to reach, but a Swedish-language product is less of
a differentiator).

Globally for context: Cursor and Claude Code are **co-leaders in the specialized AI-IDE
category at 18%**, with Claude Code at 24% in US/Canada; Claude Code awareness rose from
**31% (Apr–Jun 2025) to 57% (Jan 2026)**; GitHub Copilot still leads on raw awareness (76%).

## 2.5 What this means for the plan

1. **Korea is the highest-conviction market** — deepest AI-tool spend, most enthusiastic
   developers, a documented language gap in the leading tool, and **X reaches only ~20% of the
   population**, meaning the original's distribution channel *does not work there* and the
   local channels are wide open.
2. **France is the best European bet** — largest developer base after Germany/UK, an
   individual-maker-heavy adoption profile, and a legal requirement (Toubon) that *forces*
   French-first, which conveniently also builds the moat.
3. **Sweden is a cheap probe, not a campaign** — 179k developers and near-universal English
   make a Swedish-language board a nice-to-have rather than a wedge. Run it as a low-cost
   third launch off the same codebase; do not staff it.

---

# Part 3 — The launch plan: a primary-language attention board for KR / FR / SE

## 3.0 Positioning — what we are actually building

**Not** "outbid.lol but in Korean." That product's window is closing and a translated clone
inherits none of the novelty and all of the saturation.

**Instead:** *the local-language launch board for AI and developer tools*, where placement is
transparently, publicly bought — with the pay-to-rank auction as the **launch mechanic and
hook**, and local product discovery as the **durable business**. The board is how you get the
first 100k visitors in week one. The directory, the newsletter, and the "who launched this
month" archive are what you still have in month six.

Concretely, each market gets:

- A **primary-language** product: Korean / French / Swedish is the default and canonical
  version. English is a *secondary* toggle, not the source of truth.
- **Local currency pricing** (₩ / € / kr) with locally sensible price points — not converted dollars.
- **Local payment rails** — this is non-negotiable and is the single biggest execution risk (3.3).
- **Local compliance built in from day one** — paid-ranking disclosure is legally required in
  both the EU and Korea (3.4). The original's "no disclosure, no refunds, no moderation"
  posture is not exportable.

## 3.1 Sequencing and naming

| Phase | Market | Timing | Rationale |
|---|---|---|---|
| 1 | **South Korea** | Weeks 1–4 | Deepest AI spend, biggest language gap, X-shaped distribution vacuum |
| 2 | **France** | Weeks 5–8 | Largest EU dev base; Toubon forces the localization that becomes the moat |
| 3 | **Sweden** | Weeks 9–10 | Cheap reuse of the EU build; probe, not campaign |

**Domains.** Buy all three up front (~$50 total) plus the `.lol` variants defensively:
- Korea: a `.kr` or `.co.kr` (trust signal in Korea; note `.kr` registration rules favour a
  local presence — verify before committing) with a `.lol` as the shareable alias.
- France: a `.fr` — strong local trust signal, and required-feeling for a French-first product.
- Sweden: a `.se`.

Naming should be a **local-language verb**, not a transliterated English one. "Outbid" reads
as an English financial term in all three markets; the Korean board should be named something
a Korean developer would say out loud. Get the name from native speakers, not from a model.

## 3.2 Architecture — one codebase, three fronts

Deliberately boring, and closely modelled on what actually survived a million visitors:

```
Next.js (App Router) + TypeScript + Tailwind
        │
        ├── next-intl  ──►  ko / fr / sv / en message catalogs
        │                   (locale is the route root, not a cookie:
        │                    /ko is canonical, not /?lang=ko)
        │
        ├── Edge-cached static board page  ── the viral surface
        │       revalidate on payment webhook only
        │
        ├── Postgres (Neon/Supabase) ── ONE table, ONE sort order
        │       entries: id, market, url, label, currency,
        │                total_minor_units, created_at
        │       partitioned/filtered by `market` → three boards, one schema
        │
        ├── Payment webhooks ── per-market provider (see 3.3)
        │       idempotency keys mandatory; webhook is the only writer
        │
        └── Self-hosted analytics (Plausible/Umami) or Vercel Analytics
                ── budget for this to be the thing that breaks first
```

**Rules carried over from the teardown:**
- No AI inference, no personalization, no auth wall on the read path. The board is a document.
- The payment webhook is the **only** write path, and it must be idempotent — duplicate
  webhook deliveries under viral load are how leaderboards corrupt.
- Store money in **minor units as integers**, per currency. Never floats, never a single USD
  column with conversion.
- **Open Graph + Twitter/X cards per locale**, rendered with the local-language board state.
  The screenshot *is* the growth loop; a mis-rendered Korean OG image is a growth bug.
- Build the **analytics failure** in from the start: the original's only outage was its
  pageview vendor. Sample aggressively or self-host.

Build effort: with a boilerplate (supastarter, or any equivalent Next.js + Postgres +
Better Auth + payments kit), this is a **2–4 day build for market one**, and roughly **a day
each** for markets two and three, dominated by payments and copy rather than code.

## 3.3 Payments — the hard part, per market

### South Korea — genuinely difficult, plan around it

**Korean-issued cards require a licensed local PG. Foreign acquiring is not possible.** This
is a structural legal/market constraint, not a preference. Options, best to worst for speed:

1. **Stripe's Korea support via a local processor** — reportedly works **without a local
   entity**, covering Korean domestic cards plus **KakaoPay, Naver Pay, Samsung Pay, PAYCO**,
   with **KRW presentment**. *This is the recommended path for launch.*
2. **Eximbay** — Korea's leading cross-border PG; international cards plus select domestic methods.
3. **Direct contract with a licensed Korean PG** (KG Inicis, Toss Payments, NHN KCP) — best
   conversion, requires **local business registration**. This is the month-three upgrade, not
   the launch path.

**Wallet coverage is the conversion issue, not cards.** KakaoPay has ~36M users and is
embedded in KakaoTalk; Toss is the fastest-growing fintech; Naver Pay dominates e-commerce
checkout. A Korean board that offers only international card checkout will convert badly
regardless of how good the board is.

**Compliance note to verify with counsel: financial data must stay on Korean servers.** That
is a data-residency requirement that can invalidate a naive "everything on Vercel US-East"
deployment for any payment data you store yourself. Strong argument for keeping *zero*
payment data and letting the PG/MoR hold all of it.

### France & Sweden — straightforward via merchant of record

Use **Polar** (or Paddle / Lemon Squeezy) as **merchant of record** for both, exactly as the
original did. The MoR handles **EU VAT registration, collection, and remittance across all 27
member states** — which is the difference between a side project and an accidental
pan-European tax filing obligation.

- **France:** must support **Carte Bancaire** (the domestic scheme — not the same as Visa/MC
  co-badging in the checkout UX) and SEPA. CB support materially affects French conversion.
- **Sweden:** **Swish** (8.6M users, phone number + BankID) and **Klarna** are the expected
  methods. Card-only checkout reads as foreign in Sweden.

Cost of the MoR route: roughly **5% + fixed fee** on Polar-class pricing. On a board doing
$100k that is $5k for complete tax indemnity across the EU — buy it without thinking about it.

## 3.4 Compliance — where the original's model must change

This is the section that makes the difference between a business and a fine. **None of this is
optional, and all of it is cheap if designed in on day one.**

### European Union (France + Sweden)

| Requirement | What it means for a pay-to-rank board |
|---|---|
| **Omnibus Directive (2019/2161)** | Online marketplaces **must disclose the main parameters determining ranking, and must state explicitly that payment affects ranking**. Enforcement moved from proceedings to **first fines in 2026**. |
| **DSA** | Paid placement must be **identifiable as advertising** to users. |
| **Toubon Law (France)** | All commercial information aimed at French consumers — prices, terms, ordering flow, product descriptions — **must be available in French**. French must be *present*, not exclusive. Penalties are criminal but small (€3,750 for a legal person); the reputational and enforcement risk is the real cost. |
| **Mentions légales (France)** | A legal-notice page is **mandatory** for every commercial French website. |
| **Right of withdrawal (14 days)** | Applies to consumers. Can be extinguished for digital services **only with the consumer's express prior consent to immediate performance plus an acknowledgement that they lose the right**. The original's flat "no refunds" would not survive contact with a French or Swedish consumer authority. |

**The good news, and it is genuinely good:** the Omnibus disclosure requirement asks us to
say loudly that **rank is bought**. That is not a compliance burden for this product — *it is
the product's entire pitch*. Put "Le classement est déterminé uniquement par le montant payé"
at the top of the page in 24px and you are simultaneously compliant and on-message. This is
the rare case where the regulator and the marketing want the same sentence.

**B2B note:** most bidders will be companies, and the withdrawal right protects *consumers*,
not businesses. But you cannot assume B2B — a solo indie maker buying a slot may well count as
a consumer. Design for the consumer case; do not rely on a B2B carve-out.

### South Korea

| Requirement | Detail |
|---|---|
| **통신판매업 신고 (mail-order business registration)** | Required to sell online. Needs a business registration number and a 구매안전서비스 이용확인증 (purchase-safety certificate), filed with the local 구청. **Implies a Korean business entity** — this is the main reason Korea's "proper" launch is month two, not week one. |
| **전자상거래법 (E-Commerce Consumer Protection Act)** | Disclosure of seller identity, terms, and refund policy. |
| **표시광고법 (Fair Labeling and Advertising Act)** | **Paid placements and sponsored relationships must be clearly disclosed.** The KFTC actively enforces this and **penalties have increased since 2024**. Same design answer as the EU: label it prominently and in Korean. |
| **PIPA** | Korean personal-data law; keep collection to the absolute minimum (email + link is enough). |
| **Data residency** | Financial data on Korean servers — avoid by storing none. |

**Launch structure for Korea:** launch **via an international MoR/PG path first** (no Korean
entity, no 통신판매업 registration, cross-border sale, minimal data), validate demand for 2–4
weeks, and **only then** decide whether volume justifies a Korean entity, local PG contract,
and full domestic registration. Get Korean counsel to confirm the cross-border launch posture
before going live — this is the one item in the plan I would not ship without a lawyer's sign-off.

## 3.5 Distribution — the part that actually decides the outcome

The original's entire growth engine was **one X post to an owned audience**. We have no such
audience in any of these markets. This must be solved deliberately, and it is the highest-risk
line item in the plan.

### South Korea — X is not the channel

X reaches only **~20% of the Korean population** (10.4M users), ranking 4th among university
students at 25.9%. Meanwhile **KakaoTalk reaches 97.1% of Korean internet users** (49.1M MAU),
and KakaoTalk interaction volume grew **739% year-over-year** in 2025.

Ranked channel plan:

1. **GeekNews (news.hada.io)** — Korea's Hacker News. User-submitted, and it **pushes to
   Discord, Slack, Teams, JANDI, Google Chat, and Swit bots**, so one good submission
   propagates into corporate dev channels automatically. **This is the single highest-leverage
   post in the Korean launch.**
2. **Disquiet (디스콰이엇)** — the Korean maker/product social network (YC S22). The exact
   demographic that bid on outbid.lol. Launch here as a maker, not as an advertiser.
3. **KakaoTalk open chats** — developer and startup open chat rooms; the closest Korean
   analogue to a viral timeline. Requires a real member presence, not a drive-by drop.
4. **Threads** — meaningful and growing Korean text-social presence, unlike X.
5. **Velog / OKKY / Clien / Naver cafés** — write a *technical* build post in Korean
   ("3시간 만에 만든…"), not a promo post. The build story travels further than the product.
6. **X (Korean-language)** — secondary. Useful for the K-dev diaspora and for the
   international echo, not for domestic reach.

**Seed strategy:** the board must not be empty at launch. Pre-seed 15–25 slots with genuinely
relevant Korean AI/dev tools — offered free — so the first visitor sees a live market. An
empty auction is a dead auction.

### France

1. **LinkedIn first.** French tech discourse is unusually LinkedIn-centric versus X. A
   French-language build-in-public post from a personal account outperforms a company page.
2. **French-language X tech community** — real, if smaller than the anglophone one.
3. **Product Hunt** — reaches the francophone maker community and produces the international echo.
4. **French maker/indie newsletters, Discords, and podcasts** — the francophone
   bootstrapper scene is well-networked and receptive to a French-first product precisely
   *because* everything else in the category is English-only. Lead with that.
5. **Station F / France Digitale orbit** — for the enterprise-side bidders once the board has traffic.

The pitch that lands in France is not "pay to rank." It is **"un classement enfin transparent"**
— the honesty framing. Given >40% consumer AI adoption against 10.4% enterprise adoption, the
audience is individual makers, and they respond to the anti-algorithm argument.

### Sweden

1. **LinkedIn** — dominant for Swedish professional reach.
2. **Swedish startup Slack/Discord communities** and the **Klarna-alumni founder network** (62
   startups from ex-Klarna staff).
3. **Breakit** and Nordic tech press for the "Swedish developer builds…" angle.
4. Accept that **English content works here** — which is exactly why Sweden is a probe, not a campaign.

## 3.6 Timeline

**Weeks 1–2 — Build and legal**
- Domains; single Next.js + Postgres + next-intl codebase; three market configs.
- Payments: Stripe-with-local-processor (KR) + Polar MoR (EU) integrations.
- Compliance copy drafted **by native speakers**, reviewed by local counsel (KR posture first).
- Korean translation by a **native Korean developer**, not a model. Awkward Korean on a
  developer-facing product is fatal to credibility on day one, and it is the single cheapest
  place to fail.

**Weeks 3–4 — Korea launch**
- Pre-seed 15–25 Korean AI/dev tools free.
- Publish the Korean build story → GeekNews, Disquiet, Threads, KakaoTalk open chats, Velog.
- Watch analytics headroom; be ready to swap the vendor (the original's only outage).
- Gate: see kill criteria below.

**Weeks 5–8 — France launch**
- French-first build, Toubon-compliant, mentions légales live, withdrawal-right flow implemented.
- LinkedIn-led launch + Product Hunt + francophone newsletters.
- In parallel: decide on Korean entity + local PG based on week-3/4 data.

**Weeks 9–10 — Sweden probe**
- Same codebase, Swish/Klarna added, LinkedIn-led. Minimal spend, honest evaluation.

**Weeks 11–12 — Convert the wedge**
- Whichever market worked: ship the durable layer — the permanent local directory, a
  local-language monthly launch newsletter, and the archive. **The board buys the audience;
  the directory keeps it.** This step is what separates this plan from being the 191st clone.

## 3.7 Economics, metrics, and kill criteria

**Cost to execute all three markets:** domains (~$50), hosting and database (~$50/month),
translation (~$500–1,500 for three languages done properly), Korean legal review (~$1,000–3,000),
and time. Realistically **under $5,000 all-in** before any revenue. The MoR fee (~5%) is the
only meaningful variable cost.

**Track per market:** visitors, bid conversion rate, **median bid in local currency**, time to
first paid bid, repeat-bidder rate, and — the one that predicts survival — **the share of
traffic that comes from a *local* referrer rather than the international AI-news echo.** A
board that only gets traffic from English-language coverage of itself has not landed locally.

**Kill criteria, decided in advance:**
- **No paid bid within 72 hours of launch** in a market → the channel plan is wrong; stop and
  re-diagnose distribution before spending more.
- **Under €2,000 in the first two weeks** in a market → do not proceed to the local-entity /
  local-PG investment for that market.
- **Korea specifically:** if GeekNews and Disquiet do not produce a traffic spike, the
  hypothesis (local channels substitute for X reach) is falsified. That is the whole bet — do
  not paper over it with paid ads.

## 3.8 The risks, plainly

1. **The fad is decaying.** Revenue growth on the original bent sharply between day 5 and day 7.
   We are launching after the novelty peak, with a mechanic 190+ people have already used. This
   is the dominant risk and no amount of localization fully offsets it. The mitigation is
   structural: treat the auction as a launch mechanic, and build the directory it converts into.
2. **No owned audience.** The original's decisive asset is the one thing we cannot buy. If the
   local-channel strategy in 3.5 does not substitute for it, nothing else matters. This is why
   Korea goes first — it has the richest set of substitutable channels.
3. **Korean payments and registration friction** could delay or gate the highest-value market.
   Mitigated by the cross-border launch path, but verify with counsel first.
4. **Reputational.** Pay-to-rank invites cynicism, and in a smaller market where the developer
   community is tight-knit, cynicism travels faster than in the anglophone timeline. The
   defence is total transparency — which the EU and Korean regulators are conveniently
   requiring anyway.
5. **Clone-of-a-clone perception.** If a local competitor launches first in any of these
   markets, the second entrant gets very little. Speed matters more than polish everywhere
   except the translation.

---

## Sources

**Outbid.lol build, stack, and numbers**
- [Outbid.lol Made $178K in 77 Hours. Then the Internet Started Copying It. — Superframeworks](https://superframeworks.com/articles/outbid-lol-viral-launch)
- [$220k in 5 days — the outbid.lol interview (High Signal)](https://www.highsignal.io/220k-in-5-days-the-outbid-lol-interview/)
- [Inside outbid.lol: the pay-to-rank board taking over tech — Automatio](https://automatio.ai/articles/dev-tools/inside-outbid-lol-the-pay-to-rank-board-taking-over-tech)
- [$120,000 and One Million Visitors in 48 Hours for Solo Founder's Side Project Outbid.lol — Newsfile](https://www.newsfilecorp.com/release/310941/120000-and-One-Million-Visitors-in-48-Hours-for-Solo-Founders-Side-Project-Outbid.lol)
- [Outbid.lol: the $1 Site That Broke the Internet — Relve HQ](https://relvehq.com/blog/noise/one-dollar-pay-to-rank-board-in-3-hours)
- [outbid.lol: Simple Pay-to-Rank Website Generates $139,041 in 65 Hours](https://www.allblogthings.com/2026/08/outbidlol-simple-pay-to-rank-website-generates-139041-in-56-hours.html)
- [Outbid.lol: Why the Pay-to-Rank Board Went Viral — explainx.ai](https://www.explainx.ai/blog/outbid-lol-pay-to-rank-leaderboard-viral-august-2026)
- [What technology does outbid.lol use? — Web Reveal](https://webreveal.io/scan/outbid.lol.html)
- [outbid.lol — About](https://outbid.lol/about) · [Rules](https://outbid.lol/rules)
- [The .lol Bidding Directory Frenzy of August 2026 — SaaSCity](https://saascity.io/blog/lol-bidding-directory-frenzy-outbid-payluck-2026)
- [outoutbid.lol — every outbid.lol clone, in one directory](https://outoutbid.lol/)
- [Domain Market Intelligence Weekly, Aug 17–23 2026 — ABTdomain](https://abtdomain.com/periodic-reports/2026-08/domain-intelligence-weekly-2026-08-25)
- [Nobody Copies the Part That Matters — No-Code Exits](https://nocodeexits.substack.com/p/nobody-copies-the-part-that-matters)

**supastarter / stack**
- [supastarter — Tech Stack docs](https://supastarter.dev/docs/nextjs/tech-stack) · [Next.js + better-auth](https://supastarter.dev/nextjs-better-auth-boilerplate) · [Next.js + Drizzle](https://supastarter.dev/nextjs-drizzle-boilerplate)
- [Polar — Merchant of Record](https://polar.sh/resources/merchant-of-record)
- [.LOL TLD pricing — TLD-List](https://tld-list.com/tld/lol)

**AI coding tools by market**
- [Seoul becomes third Anthropic office in Asia-Pacific — Anthropic](https://anthropic.com/news/seoul-becomes-third-anthropic-office-in-asia-pacific)
- [Korea Makes Largest Claude Code Bet in Asia — TechTimes](https://www.techtimes.com/articles/318811/20260621/korea-makes-largest-claude-code-bet-asia-nsa-testimony-extends-export-ban.htm)
- [Naver and Kakao Deploy ChatGPT and Claude Code Together — TechTimes](https://www.techtimes.com/articles/317069/20260524/naver-kakao-deploy-chatgpt-claude-code-together-inside-south-koreas-dual-stack-enterprise-ai.htm)
- [Mapped: Which Countries Use Claude AI the Most — Visual Capitalist](https://www.visualcapitalist.com/mapped-which-countries-use-claude-ai-the-most/)
- [Claude Code Usage Statistics 2026](https://serpsculpt.com/claude-code-usage-statistics/)
- [Claude Code issue #4866 — i18n/l10n for CLI interface](https://github.com/anthropics/claude-code/issues/4866) · [#31413 — UI language localization](https://github.com/anthropics/claude-code/issues/31413) · [#24941 — Korean output switches to Japanese](https://github.com/anthropics/claude-code/issues/24941)
- [OpenAI Codex passes 5M weekly users — Techjack](https://techjacksolutions.com/ai-brief/openai-codex-passes-5-million-weekly-users-and-1-in-5-arent/)
- [OpenAI is turning Codex into an enterprise work platform — TNW](https://thenextweb.com/news/openai-codex-enterprise-plugins-sites-non-developers)
- [xAI Enters the Coding Agent Race With Grok Build — DevOps.com](https://devops.com/xai-enters-the-coding-agent-race-with-grok-build/)
- [The Rise of Grok Code Fast 1 — CodeGPT](https://www.codegpt.co/blog/grok-code-fast-1-market-dominance)
- [Cursor + SpaceXAI — a16z](https://a16z.com/cursor-spacexai-the-fastest-iterating-team-wins/)
- [AI Coding Tools Adoption Statistics by Country — Panto](https://www.getpanto.ai/blog/ai-coding-tools-adoption-statistics-by-country)
- [Mapped: AI Adoption by Country in 2026 — Visual Capitalist](https://www.visualcapitalist.com/mapped-ai-adoption-by-country-in-2026/)
- [Developer Statistics 2026 — My Codeless Website](https://mycodelesswebsite.com/developer-statistics/)

**Payments, distribution, and compliance**
- [Local Payment Methods in South Korea — Tazapay](https://tazapay.com/blog/south-korea-local-payment-methods)
- [South Korea Payments: Local PGs & Wallets — PaymentBrief](https://paymentbrief.com/articles/south-korea-payments-operator-guide/)
- [How to get a Korean ecommerce registration (통신판매업 신고증) — Punch Korea](https://www.punchkorea.com/digital-marketing-registration-%ED%86%B5%EC%8B%A0%ED%8C%90%EB%A7%A4%EC%97%85-%EC%8B%A0%EA%B3%A0%EC%A6%9D/)
- [Act on Consumer Protection in Electronic Commerce — Korea Law Information Center](https://www.law.go.kr/lsInfoP.do?lsiSeq=182153&urlMode=engLsInfoR&viewCls=engLsInfoR)
- [South Korea Social Media Statistics 2026 — Silkdrive](https://www.silkdrive.com/insights/south-korea-social-media-statistics)
- [Social Media in South Korea 2026 — InterAd](https://www.interad.com/en/insights/social-media-korea)
- [GeekNews (news.hada.io)](https://news.hada.io/) · [Disquiet](https://disquiet.io/)
- [EU Omnibus Directive Explained — Termly](https://termly.io/resources/articles/eu-omnibus/)
- [The European Regulatory Framework of Ranking Transparency on Platform Markets — IIC / Springer](https://link.springer.com/article/10.1007/s40319-025-01625-1)
- [Toubon Law — Wikipedia](https://en.wikipedia.org/wiki/Toubon_Law) · [Does Your Website Need to Be in French? — Weglot](https://www.weglot.com/blog/french-website-language-requirements)
- [Consumer information, right of withdrawal and other consumer rights — EUR-Lex](https://eur-lex.europa.eu/EN/legal-content/summary/consumer-information-right-of-withdrawal-and-other-consumer-rights.html)
- [5 Top Payment Methods in Sweden 2026 — Pay.com](https://pay.com/blog/top-payment-methods-in-sweden)
- [Payment solutions for ecommerce businesses in Sweden — Stripe](https://stripe.com/resources/more/payment-solutions-for-swedish-businesses)

---

*Compliance guidance above is research, not legal advice. The Korean launch posture and the
EU withdrawal-right flow should both be confirmed with local counsel before going live.*
