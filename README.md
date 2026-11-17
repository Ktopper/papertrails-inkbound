# Papertrails: The Inkbound

A playable action RPG inside a living pop-up storybook. Restore the Thornbound Kingdom’s first road with melee combat, paper puzzles, and equipment found along the way.

Built from [Ktopper/papertrails-fervor](https://github.com/Ktopper/papertrails-fervor), preserving its original world, assets, and exploration atlas. The local clone also retains the original Git history. The original Papertrails project is credited to [xikhar/papertrails](https://github.com/xikhar/papertrails).

## Play

[Play Chapter 1](https://ktopper.github.io/papertrails-inkbound/?level=thornbound) · [Enter Moonveil Ruins](https://ktopper.github.io/papertrails-inkbound/?level=moonveil&quality=med). You can also run locally using the instructions below.

Desktop keyboard and mouse recommended. Touch devices can tap the ground to walk and use the Strike, Heavy, and Dodge buttons.

## New in 0.6: A Road Out of Nowhere

**Book I, Chapter 1 of The Thornbound Kingdom** is now playable and opens by default. Speak to Mara, clear the split-log ambush, match the three workshop hinges, enter the abandoned mill’s separate paper interior, defeat its knight, and recover the bridge hinge. Crease school teaches **Fold**; set two anchors, survive the bridge defense, cross the restored road, and save the chapter ending. The return ladder takes you back to Mara. Chapter 2 remains planned content.

**I** opens the paused satchel. Inspect, compare, and equip your active weapon, coat, boots, lantern focus, and two different charms. Assign owned weapons to **1–3**. The workshops award the **Bookbinder’s coat**; the mill chest awards the **Briarwood cleaver**; Crease school awards the **Creaseglass focus**. Escort Ivo past two postal signs and deliver a very late birthday letter to earn the **Last-tree postmark** charm, 65 gold, and two tonics (maximum five).

**F** casts Fold in combat, interrupting and briefly creasing nearby enemies at an ink cost. The focus reduces that cost and extends the hold. **E** at a marked puzzle always casts for free, even with no focus equipped. The lantern and learned Fold cannot be dropped. Mara’s item workbench spends gold and repair paper to hone one selected weapon. Swapping equipment never refills health, stamina, or ink and cannot cancel an attack or dodge.

The chapter map (**Tab**) marks encounters, hinges, doorways, rewards, and the current objective. Ink rivers and page edges are solid boundaries; repaired decks provide actual crossings. Mill crates and hard scenery block movement. Paper hinges and foreground fading are retained. Enemies route around hard props within the authored encounters.

Save format 2 keeps equipment, ranks, shortcuts, story items, claimed rewards, completed puzzles, and bookmarks. Existing version-1 Heartland and Moonveil saves migrate in place with a backup, preserving XP, gold, weapon unlocks/upgrades, Pip’s blessing, Ivo’s contract, and the Warden. Saves remain separate per world and seed. Reload or defeat returns to a safe bookmark; claimed story rewards and completed encounters stay completed.

## Other worlds and melee combat

Choose **The Thornbound Kingdom**, **The Heartland**, or **Moonveil Ruins** from the title screen or pause menu. Use `?level=thornbound`, `?level=heartland`, or `?level=moonveil` to open a world directly.

Moonveil now opens into **the Unwritten Wilds**, a seeded world that streams in every direction with no authored border. It keeps 25 neighbouring chunks resident and regenerates the same scenery when you return. Five region types combine over 50 illustrations: Moonveil Ruins, Mosswood Wilds, Frostleaf Heights, Amberfall Hamlets, and Blossom Reach. The generated Moonveil artwork is joined by the original repo’s trees, mushrooms, cottages, towers, markets, gardens, snow pines, lanterns, and props.

Scenery uses the original spring-driven paper hinges: it rises as you approach, overshoots and quivers, then folds down behind you. Arch openings and connecting avenues stay walkable. The atlas follows the player, shows explored ground, zooms from 24 to 384 metres across, and can centre on Mara’s waystation. The original three generated images and prompts remain in `public/textures/moonveil/`.

Solid Moonveil scenery now blocks across its printed footprint, including crates, rocks, buildings, and arch posts. The collision follows the artwork’s transparent cutout and rotation. Openings remain usable, soft foliage stays passable, and foreground fading never disables collisions. Procedural props move aside as whole pieces to preserve the main avenues.

The [campaign design draft](docs/design/CAMPAIGN-DRAFT.md) maps six genre books and a final volume, including **The Thirteenth Campfire**. Chapter 1 and its Fold puzzles are playable; later chapters and the other letter spells remain planned content. The older free-roam quest loop is described below.

## Enemy attacks you can read

Each enemy locks its aim during the warning, holds a distinct pose, then releases its strike. A marked ground area, shrinking countdown ring, sound cue, and on-screen attack name explain the threat. The marked area is also the damage footprint; stepping outside it avoids the attack. At most two enemies begin an attack at once.

| Enemy | Tell and attack | Warning time |
| --- | --- | --- |
| Inkling | Pulls its quill behind its shoulder, twists, then jabs into a narrow fan | 0.95 s |
| Briar hound | Folds its legs into a crouch, raises its tail, then leaps along the marked lane | 1.05 s |
| Hollow knight | Lifts its sword overhead behind its shield, then chops down | 1.35 s |
| Hollow Warden | Raises its crown, winds its axe back, then sweeps around the full circle | 1.65 s; 1.32 s enraged |

Dodge with **Space**, or face an attacker and hold **Q** to reduce damage while spending stamina. Attack warnings remain fixed once the enemy commits; hounds do not steer during the leap. Hit reactions cancel their pending strike.

Melee attacks now animate the shoulder, torso, and weapon together: anticipation, a fast cross-body cut, follow-through, and recovery. The sword alternates swing directions. Hold J / left click for repeated strikes, or K / right click for repeated heavy attacks. Base attack times: sword **0.28 s**, axe **0.48 s**, spear **0.35 s** (about 30–34% faster than the first build). Stamina still limits sustained attacks.

## Paper silhouettes and clear sightlines

Enemies combine real 3D boxes and faceted shapes with a matte printed paper finish, matching the player’s fibre lighting. Their bodies, limbs, and armor retain depth; die-cut masks, shields, capes, cream seams, and hinge details keep the handcrafted look. They keep their articulated walk cycles and attack animations. NPC surfaces use the same matte paper print.

Trees, ruins, and other scenery between the camera and the player smoothly fade to 16% opacity, then return to solid when the view clears. The system checks the head, torso, and sides of the player, respects holes in printed artwork, and works in both Moonveil and the original Heartland. Collisions and combat stay active while scenery is translucent.

## The company between the pages

The cast now uses articulated 3D paper figures, with hinged arms and legs, turning heads, layered clothes, armor, capes, and carried props. The enemies face their targets instead of rotating like flat billboards.

- **Inklings:** pointed ears, rust-colored scarves, ink bottles, and oversized quill daggers. They weave toward the player and commit to a quill jab.
- **Briar hounds:** four moving legs, thorn ridges, teeth, amber eyes, and wagging tails. Their crouch tells you when to sidestep the leap.
- **Hollow knights:** plated shoulders, helmets, swords, and shields. Frontal armor resists light attacks; heavy attacks or flanking bypass it.
- **The Hollow Warden:** a taller armored figure with a floating crown, glowing heart, and a cape of loose pages. Below half health its crown rises and its circular attacks speed up.
- **Mara:** a cartographer with maps, a lantern, and a satchel of scrolls. She still offers free rest and weapon upgrades.
- **Ivo Mossmail:** a mushroom courier with an oversized parcel pack. Accept his delivery, defeat six new enemies, and return for 65 gold and two tonics.
- **Pip Wick:** a moth lamplighter with patterned wings and glowing antennae. His free permanent blessing reduces incoming damage by 10%.

Press **E** or tap the interaction button near a character to talk. NPCs offer dialogue and combat hints, and the journal tracks Ivo’s delivery and Pip’s blessing. Existing saves remain compatible; quest rewards can only be claimed once.

## The original free-roam adventure

- **Three melee weapons:** a quick combo sword, a sweeping axe at level 2, and a long-reaching spear at level 3.
- **Tactical combat:** directional hit detection, stamina, heavy attacks, guard, invincible dodge windows, hit reactions, and readable attack warnings. Heavy attacks bypass the Hollow Knight’s armor.
- **Three enemy types:** Inklings, Briar Hounds, and Hollow Knights with different speeds, health, reach, and windups.
- **Three chapters:** defeat 4 enemies, defeat 10 in total, then confront the Hollow Warden. The boss enrages below half health.
- **Character progression:** XP, levels, gold, healing tonics, weapon upgrades, and automatic local saves for each world seed.
- **Mara’s waystation:** rest to heal and refill tonics; spend gold to improve every weapon. Follow the gold compass marker back to camp.
- **A world to explore:** the original procedural biomes, pop-up animation, lighting, wildlife, day/night cycle, music, scraps, lanterns, and atlas remain playable.

This is a complete first playable chapter loop, intended as a foundation for expanding the RPG. Progress is stored in this browser on this device. Reloading resumes the character at Mara’s camp with full health; enemy encounters restart. The game has no accounts or cloud saves.

## Controls

| Action | Controls |
| --- | --- |
| Move | WASD / arrow keys; tap ground on touch |
| Run | Hold Shift |
| Light attack / combo | J or left mouse button |
| Heavy attack | K or right mouse button |
| Guard | Hold Q |
| Dodge | Space, in your movement direction |
| Healing tonic | H |
| Satchel: inspect, compare & equip | I |
| Fold (after Crease school) | F |
| Equip sword / axe / spear | 1 / 2 / 3 |
| Speak, inspect a puzzle, collect a chest, enter a doorway | E |
| Journal | R |
| Atlas | Tab; Escape closes |
| Pause | Escape |
| Camera | V |
| Day / night | N |
| Music | M |

Keyboard attacks aim toward a nearby enemy. Mouse attacks aim toward the pointer. Opening a menu or the atlas pauses combat. Leaving the browser window pauses the adventure.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5273. For production:

```sh
npm test
npm run build
npm run preview
```

The static game is built into `dist/`. Its assets use relative paths so it can be hosted under a subdirectory. Do not open `index.html` directly from the filesystem; serve the game over HTTP.

Useful URL options: `?quality=med` for balanced rendering, `?quality=low` for slower devices, `?mute=1` to disable audio, `?seed=42` for another world, `?level=moonveil` for the new forest level, and `?night=1` to begin at night.

## Code map

- `src/rpg/adventure.js`: combat, enemy behavior, spawning, camp, quests, and persistence.
- `src/rpg/rules.js`: weapon/enemy balance, progression, save validation, and hit geometry.
- `src/rpg/combat-motion.js`: swing phases, weapon timing, and body animation.
- `src/world/moonveil.js` and `src/game/moonveilmap.js`: the new generated-art forest level and map.
- `src/rpg/actors.js` and `cardstock.js`: articulated die-cut paper figures, printed surfaces, and animations.
- `src/render/visibility.js`: per-object scenery fading and sightline checks in both worlds.
- `src/rpg/characters.js`: character identities, delivery progress, and one-time rewards.
- `src/rpg/art.js`: melee weapon meshes.
- `src/rpg/ui.js` and `style.css`: title screen, HUD, journal, camp, pause, death, and victory.
- `tests/rules.test.js`: coverage of melee geometry, swing timing, progression, malformed saves, reward persistence, and articulated actor poses.
- `src/world`, `src/render`, `src/life`: inherited Papertrails world and rendering systems.

In development only, `?debug=1` adds a read-only combat snapshot to the canvas’s `data-diagnostics` attribute. Production builds omit it.

## Deployment

The GitHub Actions workflow runs the tests, builds the game, and deploys `dist/` to GitHub Pages on pushes to `main`. The repository’s Pages source should be **GitHub Actions**.

## Credits

Original Papertrails world, models, textures, music systems, and exploration gameplay are retained from the source repository. The Inkbound adds RPG mechanics, procedural enemy/weapon art, interface, and narrative. Existing attribution is preserved; no new license is asserted over inherited assets.
