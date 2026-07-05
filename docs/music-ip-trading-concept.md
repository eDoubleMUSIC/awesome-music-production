# Concept: A Marketplace for Trading Fractional Music Rights

*Research and concept notes — July 2026*

The core idea: a platform where fans and investors buy, sell, and trade
percentages of publishing or master rights in songs (and potentially other
intellectual property), the way companies go public — except the "shares" are
pieces of royalty-generating IP instead of corporate stock. This document
covers whether it already exists, why several attempts failed, what the
regulatory reality is, where the genuine open opportunity sits, and how it
could be profitable for rights owners.

---

## 1. Does this already exist?

Yes — the base idea has been built several times. But the *execution* has
ranged from struggling to dead, and the specific angle of **gamifying** the
experience remains largely unclaimed. Knowing the landscape is essential
before building.

### Active players

| Platform | Model | Status (mid-2026) |
|---|---|---|
| **Jukebox** (formerly JKBX) | SEC-qualified (Reg A+) "Royalty Shares" in hit songs; 60,000+ songs representing ~$6B in royalties; market-makers provide liquidity | Active; rebranded Feb 2025 with new CEO, refocusing on institutional partnerships |
| **SongVest** | "SongShares" — SEC-qualified fractional royalty shares (claims first SEC qualification for music royalties); songs by Beyoncé, Travis Scott, Cardi B, etc. | Active |
| **Royalty Exchange** | Auction marketplace for whole or partial royalty streams; oldest player, more of an investor/creator auction house than fan product | Active |
| **ANote Music** | European (Luxembourg) exchange for music catalog shares with a secondary market | Active |
| **Bolero Music** | Tokenized "Song Shares" / "Catalog Shares" structured as debt instruments backed by future revenue (Web3) | Active, niche |

### The graveyard (equally important)

| Platform | What happened |
|---|---|
| **Royal.io** | Founded by 3LAU, raised **$71M** (a16z-led). Sold fractional royalty NFTs. Shut down late 2024 amid collapsing NFT volume and unresolved US securities-law exposure. |
| **Opulous** | Music-rights NFTs ("MFTs") plus a token. Shut down after ~8 years; catalog liquidated, final claims closed April 2026. A cross-chain bridge failure dumped its token supply on the market. |
| **Vezt** | Early (2017-era) royalty-share app; effectively faded. |

### What the graveyard teaches

1. **These are securities.** A fractional interest in future royalty income
   sold to the public is an investment contract under the *Howey* test.
   Every platform that tried to route around the SEC with NFTs or tokens
   (Royal, Opulous) is dead. Every platform still standing (Jukebox,
   SongVest) went through **Regulation A+ qualification** and operates with
   broker-dealer / transfer-agent infrastructure. There is no shortcut.
2. **Liquidity is the product.** "Trading" requires a counterparty. Jukebox's
   key innovation wasn't the asset — it was committing market-makers so
   sellers always have a buyer. A marketplace with no secondary liquidity is
   just a very illiquid bond fund with extra steps.
3. **Speculation-first framing dies with the hype cycle.** Royal's volume
   collapsed with the NFT market. Products anchored on "number go up" have no
   floor when sentiment turns. Products anchored on *cash flow* (royalties
   actually paid out quarterly) and *fandom* (connection to the artist)
   survived.
4. **Catalog acquisition is the hard, expensive part.** Rights holders —
   especially majors and publishers — move slowly and demand favorable
   terms. Jukebox spent years and significant capital assembling its catalog
   before launch.

---

## 2. The regulatory reality (US)

Any version of this that sells royalty fractions to the general public runs
through one of these lanes:

- **Regulation A+ (Tier 2)** — up to $75M/year per issuer, open to
  non-accredited retail investors, requires SEC qualification of an offering
  circular, ongoing reporting, and typically a per-song or per-catalog LLC
  ("Jukebox Hits Vol. 1 LLC"-style series entities). This is the lane Jukebox
  and SongVest use. Cost: roughly $50–150k+ in legal/audit per offering, and
  months of SEC review.
- **Regulation CF (crowdfunding)** — up to ~$5M/year, cheaper, runs through a
  registered funding portal. Good for indie-artist primary offerings; caps
  are tight for anything ambitious.
- **Reg D 506(c)** — accredited investors only. Cheap and fast but excludes
  the fan audience that makes the concept culturally interesting.
- **Secondary trading** — needs an SEC-registered Alternative Trading System
  (ATS) or a broker-dealer partnership. This is its own licensing mountain;
  most startups partner with an existing ATS (e.g., via firms like Texture
  Capital, tZERO, or North Capital) rather than register themselves.

**Practical implication:** a first product should *partner* with existing
broker-dealer/ATS/transfer-agent rails rather than build them. The startup's
value is the audience, the artist pipeline, and the experience layer — not
reinventing compliance infrastructure.

One more nuance: **gamification of a securities product is itself regulated
territory.** FINRA and the SEC have scrutinized "digital engagement
practices" since the Robinhood confetti era. Streaks, leaderboards, and
prediction mechanics are fine when applied to *non-security* game layers, but
applying casino mechanics directly to security purchases invites enforcement.
This constraint actually points toward the most interesting design (below).

---

## 3. Where the open opportunity actually is

The unglamorous truth: "buy a % of a hit song's royalties" exists and is a
crowded, capital-intensive lane. Competing head-on with Jukebox for major-label
catalog is a losing move for a new entrant. But three adjacent spaces are
genuinely underbuilt:

### A. The gamified layer on top of real rights (the differentiator)

Nobody has successfully fused **fantasy-sports mechanics** with **real music
royalty assets**. The closest things are fantasy *stock* trading games and
collection apps like Soundmap (trading song *cards*, no real rights). A
two-layer design keeps the game legal and the securities boring:

- **Layer 1 — the game (free/paid, not a security):** fantasy A&R. Users
  "draft" real songs/artists into portfolios; scoring runs on real streaming
  and chart data (Spotify/Luminate). Leagues, seasons, leaderboards, prizes.
  This is DraftKings-for-A&R and is playable by anyone, instantly, with no
  SEC involvement.
- **Layer 2 — the market (regulated):** top performers earn access, rewards,
  or allocation priority in *actual* Reg A+/Reg CF royalty-share offerings.
  The game is the acquisition funnel and the proof-of-taste mechanism; the
  securities layer is deliberately conventional and compliant.

The game layer solves the three things that killed prior platforms: user
acquisition cost (games spread; securities don't), engagement between
quarterly royalty payments (the dead-air problem), and regulatory risk
(the fun lives outside the security).

### B. Indie-artist primary issuance ("going public" for a song)

Jukebox/SongVest sell *existing* hit catalog — the rights owner is usually a
fund or a legacy artist cashing out. The underserved side is the **working
independent artist raising money from their own fans**: a "song IPO" where an
artist sells 10–25% of a new release's master royalties via Reg CF to fund
marketing, videos, and touring — keeping the rest and never touching a label
advance. Fans get real upside in a song they helped break, plus perks
(credits, experiences) that securities law happily allows as bonuses. This is
the *cultural* version of the idea — "own a piece of the song before it
blows up" — and it's where a music-native founder has an edge that fintech
people don't.

### C. Other IP verticals

The same rails extend to beats/sample libraries (a producer sells a slice of
sync/licensing income from a beat catalog), podcast back-catalogs, YouTube
channels, and film/TV participations. Music is the right beachhead (best data,
clearest royalty plumbing), but the long-term company is "the exchange for
cash-flowing creative IP."

---

## 4. Can it be profitable for the rights owners?

This is the make-or-break question, because a marketplace only works if the
*supply side* (artists/rights holders) wins. The honest math:

**Why an artist would sell a fraction:**

- **Non-recourse capital at better terms than a label.** A label advance
  costs 50–85% of master royalties *plus* creative control, often in
  perpetuity. Selling 15% of one song's master to fans — keeping 85% and all
  control — is strictly better financing if the raise covers the same needs.
- **Fans-as-shareholders is marketing.** A fan who owns 0.01% of a song
  streams it, shares it, and defends it. The cap table *is* the street team.
  This flywheel is unique to music — no other asset class has holders who can
  directly increase the asset's cash flow by promoting it.
- **Price discovery and liquidity for an illiquid asset.** Today an indie
  artist's catalog is only liquid via lowball offers from catalog funds. A
  transparent market raises what their IP is worth.

**Why the platform is profitable:**

- Primary issuance fees (3–8% of raise, standard for Reg CF portals)
- Secondary trading fees (1–2.5% per trade, split with ATS partner)
- Royalty administration spread (0.5–1% of distributions processed)
- Game-layer revenue: league entry fees, premium analytics/data
  subscriptions, sponsorships — high-margin and unregulated
- Data: aggregate "fan conviction" signals are genuinely valuable to labels,
  publishers, and sync agencies as an A&R signal

**The honest risks:**

- Royalty yields on catalog are modest (historically ~5–12% annually on
  purchase price); if fans overpay in hype, returns disappoint and trust
  erodes — the platform must resist letting bubbles form in its own market.
- Royalty *collection and distribution* is genuinely messy plumbing (PROs,
  distributors, publishers, timing lags). Partnering with an established
  royalty administrator is near-mandatory early on.
- Legal cost per offering means the model needs either volume (many small
  Reg CF raises) or size (fewer big Reg A+ offerings) to cover fixed costs.
- Supply-side trust: artists have been burned by every acronym in this space.
  Transparent terms and artist-keeps-control positioning are non-negotiable.

---

## 5. Suggested shape of a first product

1. **Phase 0 — the game only.** Launch fantasy A&R with real streaming data
   and zero securities. Cheap to build, no regulatory drag, validates whether
   people actually want to "trade" songs. This alone is a fundable consumer
   product, and its engagement data de-risks everything after it.
2. **Phase 1 — first song IPOs.** Partner with a registered Reg CF funding
   portal and a royalty administrator. Run 5–10 raises for indie artists with
   engaged fanbases (10k+ true fans). Measure: raise completion, artist
   satisfaction, post-raise streaming lift.
3. **Phase 2 — secondary market.** Once dozens of offerings exist, add
   trading via an ATS partnership. Liquidity commitments (even modest
   market-making) matter more than trading features.
4. **Phase 3 — expand verticals** (beats, podcasts, channels) and pursue
   Reg A+ scale offerings.

---

## 6. Bottom line

- The raw idea — fractional trading of music royalties — **exists** and is
  regulated, capital-hungry, and partially consolidated (Jukebox, SongVest,
  Royalty Exchange, ANote).
- The **gamified layer** and the **indie-artist "song IPO"** funnel are the
  two genuinely open positions, and they compound each other: the game
  builds the audience the raises need, and the raises give the game real
  stakes.
- Profitability for rights owners is real but comes from *better financing
  terms + fan-driven promotion*, not from speculative price appreciation —
  and the platform that frames it that way is the one regulators, artists,
  and fans will still trust after the next hype cycle.

---

## Sources

- [Music Business Worldwide — JKBX launches with SEC approval](https://www.musicbusinessworldwide.com/music-royalties-trading-platform-jkbx-launches-with-regulatory-approval-from-the-sec1/)
- [Music Business Worldwide — SEC green-lights shares in a hit song (SongVest)](https://www.musicbusinessworldwide.com/the-sec-just-green-lit-the-sale-of-shares-in-a-hit-song-and-fans-can-buy-them-for-16/)
- [Music Ally — JKBX rebrands as Jukebox with new CEO (Feb 2025)](https://musically.com/2025/02/27/music-fintech-firm-jkbx-rebrands-as-jukebox-with-a-new-ceo/)
- [Billboard — JKBX invites fans to invest in songs](https://www.billboard.com/business/tech/jkbx-fans-song-music-market-invest-1235397979/)
- [Alts.co — JKBX review / market-maker liquidity model](https://alts.co/jkbx-review-invest-in-music-royalties/)
- [SongVest — How SongShares work](https://www.songvest.com/how-it-works)
- [Royalty Exchange](https://royaltyexchange.com/)
- [SEC EDGAR — Jukebox Hits Vol. 1 LLC Reg A filing](https://www.sec.gov/Archives/edgar/data/0001974755/000095012323005597/filename2.htm)
- [Chartlex — Music NFTs and Web3: the 2026 post-mortem](https://www.chartlex.com/blog/business/music-nft-web3-post-mortem-2026)
- [Opulous — final shutdown notice](https://opulous.org/)
- [Wikipedia — Royal.io](https://en.wikipedia.org/wiki/Royal.io)
- [CB Insights — ANote Music](https://www.cbinsights.com/company/anote-music) / [Bolero Music](https://www.cbinsights.com/company/bolero-music)
