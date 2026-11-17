# Papertrails: The Inkbound

A playable action RPG inside a living pop-up storybook. Take up a melee weapon, protect the unfolding trails, and defeat the Hollow Warden.

Built from [Ktopper/papertrails-fervor](https://github.com/Ktopper/papertrails-fervor), preserving its original world, assets, and exploration atlas. The local clone also retains the original Git history. The original Papertrails project is credited to [xikhar/papertrails](https://github.com/xikhar/papertrails).

## Play

Run locally using the instructions below. After the source upload and GitHub Pages deployment are complete, the game will be available at [the Pages address](https://ktopper.github.io/papertrails-inkbound/).

Desktop keyboard and mouse recommended. Touch devices can tap the ground to walk and use the Strike, Heavy, and Dodge buttons.

## Two worlds, faster combat

Choose **The Heartland** or **Moonveil Ruins** from the title screen or pause menu. Use `?level=moonveil` in the game URL to open the new level directly.

Moonveil is a new authored forest level with generated cut-paper trees, ivy arches, crystals, ferns, broken columns, lantern shrines, a textured moss floor, and a painted moonlit backdrop. It includes walkable archways, collision boundaries, three clearings, fireflies, a custom atlas, and separate character progress. The three images were created with the built-in image generation tool; exact prompts are recorded in `public/textures/moonveil/PROMPTS.txt`.

Melee attacks now animate the shoulder, torso, and weapon together: anticipation, a fast cross-body cut, follow-through, and recovery. The sword alternates swing directions. Hold J / left click for repeated strikes, or K / right click for repeated heavy attacks. Base attack times: sword **0.28 s**, axe **0.48 s**, spear **0.35 s** (about 30–34% faster than the first build). Stamina still limits sustained attacks.

## The adventure

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
| Equip sword / axe / spear | 1 / 2 / 3 |
| Speak to Mara | E, near her golden circle |
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
- `src/rpg/art.js`: original procedural paper enemies, Mara, and weapon meshes.
- `src/rpg/ui.js` and `style.css`: title screen, HUD, journal, camp, pause, death, and victory.
- `tests/rules.test.js`: meaningful coverage of hit sectors, weapon reach, progression, malformed saves, persistence, and quest phases.
- `src/world`, `src/render`, `src/life`: inherited Papertrails world and rendering systems.

In development only, `?debug=1` adds a read-only combat snapshot to the canvas’s `data-diagnostics` attribute. Production builds omit it.

## Deployment

The GitHub Actions workflow runs the tests, builds the game, and deploys `dist/` to GitHub Pages on pushes to `main`. The repository’s Pages source should be **GitHub Actions**.

## Credits

Original Papertrails world, models, textures, music systems, and exploration gameplay are retained from the source repository. The Inkbound adds RPG mechanics, procedural enemy/weapon art, interface, and narrative. Existing attribution is preserved; no new license is asserted over inherited assets.
