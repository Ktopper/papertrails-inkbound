# Papertrails inventory and equipment design

Campaign-wide equipment design. The satchel connects exploration rewards to melee choices, paper armor, and letter magic. Version 0.6 implements the Chapter 1 satchel, equipment comparison, selected-weapon upgrades, permanent Fold, and protected story items. See [the implementation notes](CHAPTER-1-IMPLEMENTATION.md) for its shipped scope and the three additional early rewards; later books, item variants, and wordcraft below remain planned.

## The satchel and the equipped character

Opening the satchel shows an unfolding paper folio: the equipped character on the left, owned items in labelled pockets on the right, and a comparison strip below the selected item. Keyboard, mouse, and controller actions all support selecting and equipping without dragging. Closing it returns focus to gameplay. The game pauses while the satchel is open, as it already does for the journal.

Proposed keyboard controls: **I** opens the satchel, **Enter** inspects or confirms the focused item, and **Escape** backs out. **F** and **C** cast the two readied words when magic is introduced. Keep the existing attack, guard, dodge, interaction, tonic, journal, and map controls. Show equivalent labelled buttons for touch and remappable actions for controllers. Entering a menu moves focus to its first useful control and prevents gameplay actions from firing behind it.

The character keeps one active melee weapon. Three weapon shortcuts remain available on **1, 2, and 3**; assigning a new item to a shortcut does not destroy the previous item. Switching the active weapon waits for the current swing or dodge to finish. Guard remains **Q** with all weapon families, using the existing weapon or forearm-block animation. A separate shield mechanic can be added later; the early shield rewards are explicitly cosmetic.

In the story campaign, acquiring a weapon grants permission to equip it immediately; there is no additional level lock on a quest reward. The existing prototype's level unlocks are preserved when importing an old save. XP still supports character progression, but story access depends on completed objectives and learned tools.

| Equipment position | What is equipped | What it changes |
| --- | --- | --- |
| Active weapon | One sword, axe, or spear from the owned collection | Attack animation family, damage, reach, timing, and stamina cost |
| Coat | One paper armor garment | Damage reduction and one small defensive tradeoff; visible folded torso layers |
| Boots | One pair | A movement or stamina benefit; no gear-dependent ability to cross required gaps |
| Lantern focus | One lens, wick, or stencil frame | A modifier to learned wordcraft; it never grants or removes the underlying required word |
| Charm A and charm B | Up to two different charms | Small situational bonuses; the same named charm cannot occupy both slots |
| Appearance patches | Owned hats, shield covers, dyes, satchels, and banners | Appearance only; kept distinct from armor statistics |

Two learned words can be readied for fast **combat casting**. These are wordbook selections, not two extra pieces of equipment. At a marked puzzle fixture, the interaction menu offers every learned relevant word and paper tool, whether or not it is readied. A player with Echo unequipped can still solve an Echo door. The lantern itself is permanent equipment; swapping its focus cannot make the lantern disappear.

The first release should use a bounded catalogue of named equipment with one copy of each unique item. There is no weight limit or gear-grid capacity to manage. Repeated rewards convert to repair materials or currency only when the reward explicitly says so; unique quest rewards never vanish into an overflow system. Materials are counted separately, and quest items never compete for equipment space.

## What the inventory contains

| Pocket | Contents | Handling |
| --- | --- | --- |
| Equipment | Owned weapon variants, coats, boots, focuses, and charms | Inspect, compare, equip, assign a shortcut, or favorite; no discard for unique named gear in the first release |
| Supplies | Healing tonics and future explicitly defined consumables | Use only through a deliberate action; show count and effect; preserve the current maximum of five tonics |
| Materials | Repair paper, thread, foil paper, pigments, and gold | Automatic collection after a fight or interaction; clearly state upgrade costs before spending |
| Story pouch | Hinge, testimony, chart, coordinates, names, invitations, signed bookmarks, and the shared pen | Protected, persistent, cannot be sold or consumed by unrelated actions; links to the relevant quest |
| Tools and words | Fold, Stitch, Turn, Cut, Hold; Glimmer, Hush, Echo | Permanent discoveries; cannot be dropped; puzzle use remains available independently of combat loadout |
| Keepsakes | Letters, dyes, portraits, shield appearances, and the banner | Records the people helped and the appearance options earned |

An item card states its name, category, current rank, effect, drawback if any, and where it was found. Comparisons show concrete changes to damage, reach, attack time, stamina cost, armor, or the specific magic effect. Avoid a single equipment score that hides tradeoffs. Color is supported by text and symbols. New-item notices offer **Inspect** or **Keep current equipment**; collecting a reward never silently equips it.

## Combat and puzzle balance

Weapons retain the existing starting families: sword **22 damage / 0.28 s**, axe **36 / 0.48 s**, and spear **27 / 0.35 s** before upgrades and attack-specific modifiers. These are the current base values, not measured DPS. Named variants preserve their family's tell, reach rules, and animation logic. A later sword should offer a different useful property rather than making every earlier weapon worthless.

Proposed armor tuning begins with modest reductions: the starter coat at 5%, the Wayfarer coat at 8%, and a specialized coat near 10–12% with a tradeoff. These values are starting playtest targets. Pip's existing 10% blessing remains a permanent reward outside charm slots. For example, 10% armor plus that blessing produces 19% reduction by multiplying the remaining damage. Cap combined passive mitigation at 40% before a successful guard, and keep guard's stamina cost explicit. Armor cannot make telegraphed attacks irrelevant.

Boots may reduce dodge cost slightly or improve recovery after a successful guard. They do not add hidden dodge invulnerability or permit clipping through solid props. Focuses modify cast behavior, such as a slightly longer Glimmer reveal or longer Echo decoy, but never expand a mandatory puzzle's solution requirements. Charms affect one readable condition at a time. Test all effects at the slowest intended frame rate as well as the normal target.

Wordcraft uses a small combat ink reserve with visible costs. Safe lanterns refill it, and marked puzzle casts are free. Required bosses always provide melee openings even when ink is empty. Magic-immune puzzle targets show why a spell did not work; experimentation never consumes a unique key or destroys the only bridge.

Equipment changes from the paused satchel take effect on resume, after an active attack or dodge completes. Equipping a focus cannot refill ink; swapping armor cannot heal; swapping a charm cannot reset its cooldown. These rules prevent repeated menu swaps from bypassing combat without forbidding convenient equipment review.

## Equipment catalogue and map locations

Every location below names a marker in the chapter atlas. **Required route** means the item is encountered during main progress; it does not mean that equipping it is mandatory. Optional gear never supplies the only solution to a main quest.

| Item | Category | First location | Acquisition | Intended use or tradeoff |
| --- | --- | --- | --- | --- |
| Wayfarer’s blade | Sword | Prologue · Letter opener | Required equip tutorial | Fast, familiar all-purpose melee; permanently retained |
| Patched coat | Armor | Prologue · Mender’s desk | Starter | Light baseline protection with no penalty |
| Travel boots | Boots | Prologue · Mender’s desk | Starter | Neutral movement baseline |
| Blank lantern | Permanent gear | Prologue · Pip’s dark lamp | Required rescue | Carries learned words; accepts one focus |
| Briarwood cleaver | Axe | I.1 · Abandoned mill | Required-route battle chest | Wide, heavy swings with higher stamina cost |
| Wayfarer’s coat | Armor | I.2 · Orchard shelter | Required-route resident gift | Reliable protection; no magic specialization |
| Dawnkeeper’s pike | Spear | I.3 · Gate guard | Required-route reward | Long reach and narrow thrusts; less forgiving against crowds |
| Mariner’s boots | Boots | II.1 · Letter crane | Required-route defense | Slightly cheaper dodge; less guard-recovery benefit than later boots |
| Tideglass focus | Magic focus | II.2 · Tide vault | Required puzzle reward through either route | Extends Glimmer's brief reveal; does not reveal through solid walls |
| Tidebreaker | Sword variant | II.3 · Tide-bell platform | Book completion | Better stamina recovery after a successful guard; slightly lower light-strike damage than an equal-rank base sword |
| Carbon cloak | Armor | III.1 · The Shadow on Strike | Optional negotiated quest | Less enemy notice before combat; lighter protection during a fight |
| Printer’s seal | Charm | III.2 · Register engine | Required-route defense | One small stamina refund after interrupting a committed attack; cooldown prevents repeated refunds |
| Margin Needle | Spear variant | III.3 · Tomorrow’s press | Book completion | Precise heavy thrust against armor; less sweeping coverage |
| Cinder coat | Armor | IV.1 · Sign bridge | Required-route defense | Reduces a small amount of ambient ember damage; ordinary attacks and fire hazards remain dangerous |
| Whisperwick focus | Magic focus | IV.2 · Speaking-tube nook | Required rescue | Longer Echo decoy; unchanged puzzle range and free fixture casts |
| Reflected-lantern charm | Charm | IV.2 · The Lantern on the Lake | Optional reflection puzzle | Slightly faster ink recovery out of combat; no mandatory puzzle cost |
| Ashward charm | Charm | IV.3 · Listener in the Ash | Boss reward | A short defensive benefit after a successful marked Hush interruption; cannot stack with itself |
| Orbit boots | Boots | V.1 · Exterior ship page | Required-route battle | Better recovery after a perfect guard; normal dodge distance and collision |
| Chosen-name charm | Charm | V.2 · The Robot Who Wanted a Name | Optional escort | A small benefit while protecting an ally; no escort is balanced around owning it |
| Starfoil coat | Armor | V.3 · Unapproved horizon | Book completion | Stronger physical protection with a modest stamina-recovery cost |
| Remembrance focus | Magic focus | VI.1 · Guest alcove | Required conversation | Longer Hush duration against valid channels; cannot silence every melee attack |
| Hemstitched charm | Charm | VI.3 · House’s final page | Book completion | Small recovery after blocking a heavy strike; cooldown shared across repeated triggers |

The earlier side-story rewards keep their roles: Alder's shield and the Marshmallow Knight's toasted shield are appearances; Ivo's satchel is an appearance and correspondence reward; the pigment case supplies dyes; the smallest moon supplies armor paper; Pip's final lamp is an appearance. The final banner is cosmetic. Ada's bookmark grants Hold as a permanent tool, and the shared pen is a story item. None occupies a combat charm slot.

## When permanent abilities arrive

| Ability | Required map marker | First required application |
| --- | --- | --- |
| Fold | I.1 · Crease school | Bridge anchors and castle-road gate |
| Glimmer | I.2 · Village lantern | Address court |
| Stitch | II.1 · Sail loft | Departure dock |
| Turn | III.1 · Dot’s office | Three notice boards |
| Hush | IV.1 · Hush clearing | Ink-print fork |
| Echo | IV.2 · Speaking-tube nook | Guest’s false frame |
| Cut | V.2 · Discarded tool bench | Lock gallery |
| Hold | VI.2 · Keeper’s cabinet | Torn corridor |

Books II and III can be played in either order; neither requires the other's new tool. Books IV and V also allow either order. The star book does not require Hush or Echo, and the campfire book does not require Cut. The House begins only after both are complete. Local knots in earlier books can be struck or loosened normally; only clearly marked red **master stitches** require Cut.

## Upgrades, rewards, and saving

Mara's bench upgrades a named item using gold and the appropriate paper material. Offer one clear rank increase with the resulting values shown before spending. Keep a short rank range initially, consistent with the existing five upgrade ranks. No random affix rolling, durability loss, inventory weight, crafting trees, or paid respec is needed for the first implementation.

Save an acquired item before showing its reward celebration. Use a stable reward identifier for each quest or chest, so reloading or revisiting cannot duplicate it. Required items are granted through stable authored locations or completion records, never a random drop table. If a grant is interrupted, the location or Ivo's claim record must offer it again exactly once. Death returns to the latest safe bookmark without deleting equipment, story items, permanent tools, completed puzzle states, or earned blessings. The encounter itself resets.

For a future save migration, preserve the current version-1 data: XP, gold, kills, selected weapon, upgrade rank, tonics, Warden completion, Pip's blessing, and Ivo's accepted/claimed delivery state. Grant ownership of every weapon already unlocked by the saved level, retain the selected weapon, and apply the old global upgrade rank to those existing weapons. New story rewards that grant an already-owned base weapon acknowledge ownership instead of replacing or lowering it. Do not mark the new story campaign complete solely because the old prototype Warden was defeated; offer a clear recap or campaign entry without removing earned gear.

A version-2 inventory record should keep separate fields for owned item IDs and ranks, equipment slots, three weapon shortcuts, two readied words, material counts, protected story flags, learned tools/words, appearance choices, and claimed reward IDs. Keep existing per-world and per-seed save separation during migration. A future shared campaign profile should be an explicit later migration with a backup, not an accidental merge of unrelated saves.

## First implementation slice

Build the prologue and Book I inventory path first: starter gear, a paused satchel, equip and compare, the three existing weapon families, one coat upgrade, tonics, protected story items, and save migration. Add material upgrades and two charms after that loop works. Add focus slots and the wordbook when Glimmer is playable; do not display inert spell buttons as if magic were implemented.

Acceptance means the player can acquire the mill axe, inspect its tradeoff, assign it to a shortcut, equip it, see the correct weapon and combat behavior, reload without losing it, and return to the same puzzle with the required tool still available. Verify that full tonic counts do not erase quest rewards, repeated rewards cannot duplicate gear, unequipped spells remain usable at puzzle fixtures, and equipment swaps do not restore resources or cancel recovery.
