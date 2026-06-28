# Untitled Animal Open-World Game — Concept Doc

> Status: **Planning / discussion.** No code, no commitments — this captures the
> design thread so it doesn't evaporate. Everything here is changeable.

## One-line pitch

**Pick your species, pick your game.** An open-world game where you can play as
*any* animal that exists — or a person — in one living world. The creature you
choose isn't a skin; it's the genre. You start small, grow up, climb the food
chain, complete your species' story, and once the world opens up, everyone
fights to the top.

## Why this is interesting

Nothing combines these three ideas at once:

1. **The animal you choose is the genre selector.** Be an ant → tiny-scale
   colony game. Be a hawk → aerial predator game. Be a shark → aquatic survival
   horror. Be a wolf → pack-tactics turf war. Be a human → the familiar
   open-world layer. One world, many genres, decided by what you spawn as.
2. **Everything shares one world and one food chain, at different scales.** The
   hawk overhead can see the ant colony. The human in the car can roadkill the
   wolf. The whale can swallow the shark that thought it was the apex. Every
   player sits somewhere on the same food web.
3. **Scale is the real superpower.** An ant's whole world is one backyard. A
   human's is a city. An elephant *is* terrain. A whale's world is the entire
   ocean and the city is irrelevant. Same physics, same world, wildly different
   sense of "big." Nobody has shipped an ant and a whale in one continuous
   space.

## Core loop (shared by every animal)

This single loop is what makes the insane scope tractable — every species runs it:

```
spawn small & vulnerable
   → eat / survive / complete goals
      → grow
         → unlock power
            → climb the food chain
               → become the local apex
                  → world opens up → battle for the top
```

- A lion cub, a whale calf, a hatchling hawk, a single ant — all start at the
  bottom, all run the same growth curve. The animal is the skin + stats on top.
- Early game **everyone is prey** (a baby whale is shark food; a lion cub can be
  taken by a hawk). Terror flows downhill.
- Late game **you're the threat.** Same player, opposite end of the food web,
  over one playthrough. It's a journey, not just a stat bump — you grow because
  you *ate*, not because a number went up.

## How to actually build "100 animals" without 100 years

You don't build 100 animals. You build **systems that generate them.** Four pillars:

1. **One growth loop** — above. Built once, reused by everything.
2. **~6 body archetypes** — each is a movement rig + skeleton. Every animal is a
   *variant*: change size, speed, diet, attacks. A fox and a lion are the same
   rig with different numbers. One archetype → ~15 playable animals.
   - **Land-runner** — wolf, fox, lion, bear, cat, deer
   - **Flyer** — hawk, eagle, owl, crow
   - **Swimmer** — shark, orca, octopus, (later) whale
   - **Swarm / small** — ant, rat, bee (shared colony + scale mechanics)
   - **Heavy / mega** — elephant, rhino, bison (you reshape terrain)
   - **Biped** — human (the familiar open-world layer)
3. **Shared / procedural world** — build the world once; *scale* changes what it
   means (ant's backyard = whale's puddle). Don't hand-craft a map per animal.
4. **Emergent stories** — don't script 100 storylines. Set up food chain +
   territory + growth rules and quests write themselves from templates: "grow to
   adult," "claim this territory," "survive the migration," "dethrone the local
   apex." Same templates, every species.

## Signature set-pieces (every species is a different kind of fear)

- **Hawk swarm** — death from above, you can't escape *up*. Cheap to build via
  Boids flocking (3 dumb rules per bird → 1000 birds look coordinated).
- **Elephant stampede** — a moving wall, you can't *stop* it; it goes through
  cover, not around.
- **Lion pack** — coordinated ambush, you can't *outsmart* it; they surround and
  cut off exits.
- **Shark / deep water** — you can't go in the *water*.
- **Whale** — not a swarm, wall, or pack: a *moving piece of geography*. Bigger
  than the boats. Resets the ocean's entire power ranking just by surfacing.
- **Ant / rat swarm** — you can't even *see* it coming until you're covered.

These collide with **each other**, not just with humans — a stampede tears
through lion territory, hawks dive the elephants' eyes, and the smartest human
play is sometimes to let two species fight and loot the aftermath.

## The world: one continent, multiple ecosystems

Start with **one continent** ringed with biomes — huge to the player, buildable
for the team. The borders between ecosystems are where the game happens.

- **Coastline / shallows** — land meets sea; the most dangerous border. Sharks
  lunge in; land animals get dragged under.
- **Open ocean** — deep-water predator zone (whale/shark expansion home).
- **Forest** — dense, cover-based hunting. Wolves, foxes, bears, owls, deer.
- **Grassland / savanna** — open, no cover. Stampede + lion-pack country.
- **Mountains / highlands** — vertical. Eagles, goats, big cats rule the peaks.
- **Wetland / river** through the middle — connective tissue; everyone needs
  water, so it's the natural conflict magnet.

Why it scopes well:

- Each ecosystem = one art/creature pass that unlocks a whole roster at once.
- The growth loop maps onto geography: you start in a safe-ish corner and range
  farther as you grow. Crossing into a new biome is the natural "level gate" —
  the danger itself gates you, no invisible walls.
- Migration works even on one continent: herds and birds move between biomes
  seasonally → roaming world-events without needing a second continent yet.

## Proof it ships: World of Warcraft

WoW validates the whole tech stack, 15+ years ago:

- **Vash'jir** = a complete, living underwater zone with 3D combat and
  questlines. "The ocean is its own continent" is shipped tech, not fantasy.
- **Reused skeletons** = thousands of creatures from a handful of rigs (wolf /
  worg / hyena / fox = one family). Exactly the archetype trick.
- **Leveling 1→max** = the growth loop with a coat of paint. We make it literal.
- **Seamless biomes** = deserts, forests, oceans, snowfields stitched into one
  continuous walkable/swimmable/flyable world.

The key lesson: **even Blizzard built it in layers.** Vanilla shipped two
continents; the underwater zone came *seven years later.* Prove the core loop on
a smaller world, then expand.

## Roadmap (WoW-style expansions)

- **v1 ("vanilla")** — one continent, the growth loop, ~2 archetypes that share
  a food chain (e.g. land-runner + flyer). Prove it's fun.
- **Expansion 1** — the ocean: whales, sharks, the deep (our Vash'jir).
- **Expansion 2** — the sky, migration, world-roaming megafauna as server-wide
  events.
- **Expansion 3** — the battle-royale endgame: 100 *different species* dropped
  into one shrinking map. Asymmetry *is* the meta — eagle vs. bear vs. rat swarm
  vs. a guy with a shotgun. Nobody's balanced that.
- **And grow from there** — new biomes on the same landmass → a second continent
  → the whole planet. Players who were there for "vanilla" watch their continent
  become a world.

## The "prove it first" vertical slice

Smallest thing that proves the entire game:

- **One small map**, two archetypes: **land-runner (you're a cub)** + **flyer
  (you're a hawk that can eat the cub)**.
- The full growth loop: born tiny → grow → climb → the two species genuinely
  threaten each other.
- If "born tiny, grow up, climb the chain, and both species are a real threat to
  each other" is fun with just those two — the whole concept is proven.
  Everything else is content on a spine you already know works.

## Open questions to chew on next

- What does a ground player *do back* against a swarm? (Every "fear" needs a
  counter, or it's a cutscene you can't win.)
- How literal is the scale? Can an ant and a whale really share one physics
  space, or do we fake the extremes?
- Single-player story first, or multiplayer-first (the battle royale / swarm
  chaos is inherently multiplayer)?
- How much of the world is procedural vs. hand-crafted?
