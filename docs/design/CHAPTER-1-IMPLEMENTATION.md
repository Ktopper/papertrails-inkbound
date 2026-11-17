# Chapter 1 implementation · 0.6.0

The Thornbound Kingdom opens with **A Road Out of Nowhere**, selected by `?level=thornbound`. This is the first playable slice of the atlas, with a 44 × 51 unit authored outdoor page and a separate 12 × 12 mill interior. The wider book geography and remaining chapters are still design plans.

The route follows the atlas: Mara → split-log battle → three workshop hinge puzzles → mill battle and chest → Fold training → two bridge anchors and a defense → castle-road ending. Hard ink cuts enforce the workshop crossing and final bridge. Buildings can have their own paper pages: the mill doorway transitions into its room and its exit returns outside. This establishes the interior pattern for future buildings.

The chapter includes the planned mill cleaver plus two earlier equipment opportunities added for this playable slice: the **Bookbinder’s coat** from restoring all workshops and **Creaseglass focus** from Fold training. They do not replace the later Wayfarer’s coat or Tideglass focus. Ivo’s optional birthday delivery adds the **Last-tree postmark** charm alongside the atlas’s gold and tonics.

The satchel supports equipment comparison, owned-weapon shortcuts, six functional gear slots, removable optional gear, protected story items, permanent Fold, counted supplies and repair paper, and selected-weapon upgrades at Mara. Learned tools remain usable at puzzle fixtures regardless of gear. Fold’s combat form is a short nearby interruption, supported by readable letter particles and a visible ink meter; later wordcraft is not implemented yet.

Rewards are recorded once. Full tonic supplies cannot erase equipment. Equipment swaps preserve resources and wait until an active swing/dodge has finished. Version-1 saves migrate to version 2, retain old unlocked weapons and ranks, and receive a local backup. New story progress does not inherit the old prototype’s Warden victory. Each world and seed keeps its own save.

Validation covers the main quest gates, wrong puzzle answers, all equipment categories, the optional delivery, material spending, duplicate rewards, malformed saves, version-1 migration, collision at cuts/crates/page edges, and enemy routing around crates. Browser playtesting uses a development-only travel panel for reaching fixtures; battles and puzzles are completed through the normal controls. That panel and the read-only diagnostic snapshot are excluded from production builds.
