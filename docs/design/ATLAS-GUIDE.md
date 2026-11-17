# Papertrails world and chapter atlas

This design atlas contains seven book overviews, 21 chapter layouts, the prologue, and the Margin refuge. Each chapter marks encounters, puzzle sites, safe areas, optional stories, and the places that award equipment or permanent abilities. These are proposed level layouts, not levels already built in the game. Positions are schematic and not to scale.

## Reading the maps

Solid routes show first-time main progression. Dashed branches lead to optional side stories and return to their junction. Dotted routes are shortcuts opened from the far side. A named gate states the action or story condition needed to continue. Numbered markers identify places; inspect a marker for the battle, puzzle, reward, or world change there.

**W** marks a weapon reward, **A** marks armor or boots, and **M** marks a magic focus, charm, or the permanent lantern. These markers appear at the exact chapter location and on its book overview. The selected location names the item and how it is earned.

The campaign order is **Prologue → Book I → Books II and III in either order → Books IV and V in either order → Book VI → Final volume**. Both books on a shelf must be freed to open the next shelf. The Margin stays reachable between chapters through unlocked bookmarks. Entering a boss arena temporarily commits the encounter; dying returns to its nearby safe bookmark.

## Layout rules

Authored quest locations keep stable addresses. Procedural outskirts add discoveries, small encounters, and visual variety around them. The current Moonveil biomes belong to the terrain of Book I; their five labels are not substitutes for the seven story volumes.

Each chapter should alternate pressure and relief. A safe arrival establishes the goal; a short battle teaches or tests a threat; a puzzle changes the physical route; a rest or conversation creates breathing room; and the final encounter or transformation resolves the chapter. The atlas varies this structure with city loops, island alternatives, revisited clearings, and a three-branch evacuation. Do not spawn an unrelated patrol inside a mandatory clue conversation or puzzle tutorial.

Combat areas need visible space to dodge, a readable entrance, solid cover, and a retreat or retry point. Use the existing rule of no more than two enemies committing attacks at once. Ground warnings must remain truthful and readable through paper effects. A narrow traversal bridge should not also host a large sweeping enemy unless a safe response is clearly provided.

Puzzle gates are physical changes with visible states: a bridge becomes stable, a door swings clear, a register restores a name, or an invitation opens a spine. Required clues are available without optional quests. Wrong arrangements reset safely, do not consume a unique key, and give understandable feedback. A solved chapter puzzle stays solved after death or streaming; the local combat encounter may reset.

Hard walls, trunks, crates, rocks, closed doors, and bridge rails block walking, running, and dodging. A hole in the printed art is traversable only when it has sufficient body clearance. Foreground fading preserves collision. Opening a door removes its blocker only after the panel clears the route; a bridge becomes walkable only when stable. Hold puzzles retain a safe control landing and a recoverable return route.

Use **1.2 m clear width** as an initial main-corridor blockout target and about **6–10 m clear diameter** for ordinary group fights, with larger boss arenas. These are proposed playtest dimensions, not measured properties of the current artwork. Check them against the actual hero, dodge distance, camera, and attack footprints before final art. Do not cut invisible walk-through strips through solid scenery to make a route work; move or reshape the prop.

## Distinct book geography

| Book | Spatial identity | Main traversal and problem solving |
| --- | --- | --- |
| I · Thornbound Kingdom | Woods → river → village → castle | Repaired workshop routes, a raised bridge, folded walls, crown anchors |
| II · Sea Without a Shore | Harbor → alternative island routes → flagship | Docks, stitched crossings, tide leaves, boarding lanes |
| III · Carbon Street | Street loops → printing district → courthouse | Back alleys, carbon reverses, evidence rooms, docket anchors |
| IV · Thirteenth Campfire | Shared camp with three returning tale trails | Sound and ink tracks, folding cabin rooms, name-fragment clearings |
| V · Clockwork Constellations | Separate paper planet discs and orbital rings | Star charts, stitched bridges, conveyor locks, orbital cover |
| VI · House of Last Lights | A persistent vestibule with changing wings | Invitations, layered memories, held exits, room transformations |
| Final · Book of One Ending | Forced genre seams converging on the Press | Combined tools, three evacuation branches, six bindings, final arena |

## Equipment and exploration

The [inventory design](INVENTORY-DESIGN.md) lists each named item and its exact atlas marker. Reward locations marked as part of the required route are guaranteed discoveries, but no optional loadout is required to finish the campaign. The three weapon families stay viable, armor offers protection with tradeoffs, and magic focuses modify words already learned through the story.

Optional side stories provide characters, appearances, resources, and useful alternative gear. Later callbacks acknowledge completed quests while preserving a complete main route for a player who skipped them. The atlas retains all 21 local side stories from the campaign draft; some chapters have two branches, while boss chapters may have none.

## Source and iteration

The editable design data is in `atlas/atlas-data.mjs`. The renderer generates the atlas JSON, individual map sheets, and chapter reference from that data. The campaign narrative remains in [CAMPAIGN-DRAFT.md](CAMPAIGN-DRAFT.md). The atlas names encounters and rewards at a level suitable for blockout; enemy counts, travel times, armor percentages, and room dimensions still need playtesting.

The first useful build is Book I, Chapter 1: one waystation, one trail fight, three workshop hinges, the mill reward, a Fold tutorial, and the defended bridge. It validates combat, inventory, puzzle persistence, collision, and a permanent world change together. Build subsequent chapters only after that loop is readable and enjoyable.
