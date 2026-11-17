// Design data only. These maps are not loaded by the playable game.
// Coordinates describe proposed spatial relationships, not surveyed game units.
const N = (label, kind, play, reward = '', grants = [], requires = []) => ({label, kind, play, reward, grants, requires});
const S = (at, label, play, reward, position) => ({at, ...N(label, 'Side quest', play, reward), optional:true, position});
const C = (title, ground, goal, outcome, nodes, sides = [], options = {}) => ({title, ground, goal, outcome, nodes, sides, ...options});
const layouts = {
  forest:[[12,80],[32,67],[20,38],[46,43],[64,24],[84,22],[82,72]],
  sea:[[12,78],[28,52],[48,78],[49,24],[71,48],[88,22],[87,79]],
  city:[[13,80],[37,80],[37,49],[14,23],[62,23],[85,48],[85,80]],
  camp:[[15,78],[14,43],[35,20],[62,23],[84,48],[66,78],[40,66]],
  stars:[[12,79],[25,46],[46,67],[52,23],[79,22],[87,51],[73,81]],
  house:[[15,81],[15,51],[15,20],[48,20],[81,20],[81,51],[81,81]],
  finale:[[12,80],[30,56],[13,24],[49,21],[78,25],[85,57],[66,81]],
};
export const books = [
  {id:'b1',number:'I',title:'The Thornbound Kingdom',shape:'forest',refuge:'Mara’s waystation',entry:'Finish the prologue and rescue Pip and Ivo.',requires:[],
   terrain:'A river divides the workshop woods from an erased village. Castle walls rise beyond the blossom orchard; snowy uplands and mushroom groves form optional outskirts.',
   scale:'Proposed authored core: about 360 × 280 m, with streamed woodland beyond it.',
   effect:'Promises raise folded roads; cream cut edges catch lantern light; missing names return as ink.',
   chapters:[
    C('A Road Out of Nowhere','Workshop woods and a river crossing','Repair the workshops, recover a hinge, and reopen the castle road.','The bridge stays open; Mara’s waystation becomes a permanent refuge.',[
      N('Waystation','Safe','Meet Mara, open the satchel, equip the starter blade and coat, and practice guard and dodge.','Wayfarer’s blade; patched coat; travel boots; blank lantern.'),
      N('Split-log trail','Battle','Fight two quill Inklings, then a hound. A broad clearing gives room to read the leap lane; a retreat path returns to camp.','Gold and repair paper.'),
      N('Three workshops','Puzzle','Reconnect three marked hinges in any order: a printer’s floor, a carpenter’s stair, and a baker’s awning. Residents raise the mill approach.','Workshop agreement.',['workshops']),
      N('Abandoned mill','Battle','Circle a knight around solid crates and use a heavy strike to expose the bridge hinge. Clear the room before inspecting it.','Bridge hinge; Briarwood cleaver.',['hinge']),
      N('Crease school','Puzzle','Mara demonstrates Fold on a safe miniature bridge. Repeat it on the marked river crease; failure resets the hinge without a cost.','Permanent Fold tool.',['Fold'],['hinge']),
      N('Bridge anchors','Battle','Defend two anchors in one short encounter while the bridge rises. A failed defense resets only the encounter; the hinge remains recovered.','Bridge opened.',['bridge'],['Fold','workshops']),
      N('Castle-road gate','Exit','Cross the stable bridge, lower a return ladder, and reach the village signpost.','Chapter checkpoint; next chapter route.',[],['bridge'])
    ],[S(2,'A Letter for the Last Tree','Escort Ivo along two trail signs, fight root-bound Inklings, then deliver the birthday letter. The route reconnects with the mill clearing.','65 gold; two tonics; the tree’s address branch.')],{shortcut:[6,1],shortcutLabel:'Bridge ladder opened',gates:{'5-6':'Fold + workshop agreement','6-7':'Bridge stable'}}),
    C('A Kingdom in the Margins','Erased village, orchard, and castle outer wall','Recover the residents’ testimony and reach Queen Else.','The queen frees the roads; the castle approach unfolds.',[
      N('Village lantern','Safe','Meet Pip on the required route. Reveal one faded address with the lantern stencil before leaving the safe circle.','Glimmer learned.',['Glimmer']),
      N('Blank market','Battle','Hounds weave around paper stalls while one knight guards the well. Solid stall backs provide lanes but remain faded when they hide the hero.','Repair paper and ink.'),
      N('Address court','Puzzle','Use Glimmer to read three addresses and place each resident’s testimony at the matching door. Captions and shapes support the clue.','Three testimonies.',['testimony'],['Glimmer']),
      N('Orchard shelter','Safe','Rest and compare the new coat with the starter armor. Pip’s optional blessing is available through the orchard side story.','Wayfarer’s coat.'),
      N('Layered wall','Puzzle','Fold marked battlements in an order shown on their reverse-facing silhouettes. Keep a ground-level reset lever reachable.','A walkable wall stair.',['wall-route'],['Fold']),
      N('Queen’s gallery','Battle','Defeat the red-thread guard and speak to Queen Else. Hand over the testimonies after the battle; she writes the decree.','Departure decree.',['decree'],['testimony','wall-route']),
      N('Courtyard overlook','Exit','Open the courtyard checkpoint and a lift back to the market. The Warden is visible before the next chapter begins.','Castle shortcut.',[],['decree'])
    ],[S(4,'The Moth and the Missing Dawn','Relight three orchard wicks using the residents’ remembered order. Glimmer exposes the same clue in text and symbols.','Pip’s permanent 10% blessing; a restored resident’s name.')],{shortcut:[7,2],shortcutLabel:'Gallery lift opened',gates:{'5-6':'Wall stair + testimonies'}}),
    C('The Knight Beneath the Crown','Moonveil gate, curtain wall, and inner courtyard','Break the Warden’s crown binding and free Sir Alder.','The book writes its own ending and opens the first permanent Margin room.',[
      N('Overlook camp','Safe','Refill supplies, equip weapons, and inspect the courtyard. The boss does not begin until the inner threshold is crossed.','Rest and equipment checkpoint.'),
      N('Gate guard','Battle','Face a shielded knight and two Inklings. Broad side lanes permit flanking without walking through the arch pillars.','Dawnkeeper’s pike.'),
      N('Crown plaques','Puzzle','Use Glimmer to read three remembered duties and Fold their plaques into the matching wall recesses.','Three crown anchors exposed.',['anchors'],['Fold','Glimmer']),
      N('West lantern','Safe','Lower a gate to the overlook. Preview the Warden’s attack shapes on empty training marks.','Boss retry checkpoint.'),
      N('Warden’s court','Boss','Survive the charged sweep, strike an exposed crown knot, then repeat through three phases. Ordinary knots break with any weapon; Cut is not required.','Warden freed.',['warden-free'],['anchors']),
      N('Ending balcony','Story','Return the final page to Queen Else. Receive the residents’ signed bookmark and let Alder choose his next step.','Thornbound bookmark.',['bookmark-b1'],['warden-free']),
      N('Margin doorway','Exit','The fallen wall unfolds into the shared library refuge. Both sea and city books become available.','Margin unlocked.',[],['bookmark-b1'])
    ],[S(6,'A Knight Without an Order','After liberation, retrieve Alder’s shield from the watchtower and escort him if he chooses to guard the Margin.','Shield appearance; optional gatekeeper.')],{shortcut:[4,1],shortcutLabel:'West gate unbarred',gates:{'4-5':'Three crown plaques solved'}})
   ]},
  {id:'b2',number:'II',title:'The Sea Without a Shore',shape:'sea',refuge:'Nell’s lettership',entry:'Free Book I. This book and Book III can be played in either order.',requires:['Fold','Glimmer'],
   terrain:'A customs harbor opens onto three loose island leaves. A chosen return port and stitched boarding lanes lead to Admiral Still’s ship. Water is a physical boundary; travel uses docks and authored crossings.',
   scale:'Proposed core: harbor 180 × 140 m; three island leaves about 120 m across; a separate 90 m flagship.',effect:'Curling wave strips, envelope sails, and stitched bridges change with the tide.',
   chapters:[
    C('A Ship Made of Letters','Harbor docks and customs ledger fort','Free the crew and stitch the confiscated letters into a sail.','Nell’s ship becomes a refuge and the harbor opens.',[
      N('Harbor slip','Safe','Meet Nell and inspect three weapon shortcuts. A safe gangway teaches the dock edges and return route.','Rest and supplies.'),
      N('Tariff dock','Battle','Fight folded customs guards between cargo stacks. Telegraphs appear on planks, never beneath opaque cargo.','Gold and thread.'),
      N('Crew ledger','Puzzle','Match three names to confiscation stamps; Fold ledger tabs to release the crew without erasing their identities.','Crew released.',['crew'],['Fold']),
      N('Sail loft','Puzzle','Nell teaches Stitch with clearly marked sail corners. Repair a short gangway before joining the main sail.','Permanent Stitch tool.',['Stitch'],['crew']),
      N('Letter crane','Battle','Defend the rotating crane while the crew lowers the sail. Two attackers commit at most; railings keep the player on deck.','Mariner’s boots.'),
      N('Departure dock','Puzzle','Stitch the last sail seam and raise the gangway. The dock latch reopens from the ship side.','Ship launched.',['ship'],['Stitch']),
      N('Lettership cabin','Exit','Save aboard Nell’s ship and choose the island landing.','Mobile refuge.',[],['ship'])
    ],[S(2,'The Treasure Nobody Buried','Trace three crew maps to lost belongings around the harbor; return each to its owner.','Upgrade paper; a shared cabin mural.'),S(3,'Return to Sender','Free Ivo’s mailbag from the customs annex, then deliver Nell’s invitation through the Margin.','City alternate entrance; postal shortcut.',[12,40])],{shortcut:[6,1],shortcutLabel:'Dock latch opened',gates:{'5-6':'Stitch learned'}}),
    C('The Island That Changed Its Mind','Three connected island map leaves','Recover the tide chart through either residents’ chosen route.','The tide moves and the chosen island becomes a return port.',[
      N('Landing pier','Safe','Nell waits with a supply chest. A visible map shows both island routes reaching the same tide vault.','Refill and equipment change.'),
      N('Island council','Story','Listen to sanctuary and port residents. Choose which crossing to support; both choices grant the same required chart.','Route choice recorded.'),
      N('Sanctuary reeds','Puzzle','Stitch stepping leaves around nesting grounds and Fold a quiet boardwalk. This is the puzzle-heavy alternative.','Sanctuary passage.',['island-route'],['Stitch','Fold']),
      N('Visitor causeway','Battle','Clear two short boarding-guard encounters and repair a public landing. This is the combat-heavy alternative.','Port passage.',['island-route']),
      N('Tide vault','Puzzle','Read the rising and falling tide marks, then align three wheel-shaped map leaves. The controls remain on dry ground.','Tide chart; Tideglass focus.',['tide-chart'],['island-route']),
      N('Signal bridge','Puzzle','Stitch the chart’s marked crossing and raise Nell’s signal flag. Both branches remain revisitable.','Return-port crossing.',['port'],['Stitch','tide-chart']),
      N('Chosen return port','Exit','A settlement appears at the chosen shore. Board Nell’s ship for the flagship approach.','Permanent port checkpoint.',[],['port'])
    ],[S(3,'The Monster Under the Map','Follow a huge printed shadow to a small octopus; Stitch its torn home rather than attack it.','Optional salvage bay; future rescue-line helper.')],{edges:[[1,2],[2,3],[2,4],[3,5],[4,5],[5,6],[6,7]],shortcut:[7,1],shortcutLabel:'Return ferry',gates:{'3-5':'Sanctuary route complete','4-5':'Port route complete'}}),
    C('The Admiral of Still Water','Flagship decks and the captured tide bell','Defeat Admiral Still and free the tide bell.','A moving sea replaces the endless calm; the star thread route is recovered.',[
      N('Nell’s forward deck','Safe','Prepare gear and inspect the enemy ship across the paper waves.','Boss-route checkpoint.'),
      N('Boarding strips','Battle','Fight sabre guards as the wave strips lift. Marked safe planks never disappear without warning.','Thread and tonics.'),
      N('Stitched lane','Puzzle','Anchor three boarding seams with Stitch. Ordinary ropes can be struck with any melee weapon.','Stable boarding lane.',['boarding'],['Stitch']),
      N('Quarterdeck shelter','Safe','Open a hatch to Nell’s deck and refill. The boss arena begins beyond the bell rail.','Retry hatch.'),
      N('Admiral’s ring','Boss','Read a sabre salute before the lunge; guard, dodge, and punish. Between phases, loosen ordinary tide-bell lashings.','Admiral defeated.',['admiral-free'],['boarding']),
      N('Tide-bell platform','Story','Ring the bell with the crew. Their ending gives the voyage a future without a fixed last port.','Sea bookmark; Tidebreaker sword.',['bookmark-b2','star-thread'],['admiral-free']),
      N('Margin ferry','Exit','Nell opens a ferry berth in the Margin. Book III remains available if unfinished.','Second-shelf route when Book III is also freed.',[],['bookmark-b2'])
    ],[],{shortcut:[4,1],shortcutLabel:'Boarding hatch',gates:{'4-5':'Boarding lane stable'}})
   ]},
  {id:'b3',number:'III',title:'Midnight on Carbon Street',shape:'city',refuge:'Dot’s case office',entry:'Free Book I. This book and Book II can be played in either order.',requires:['Fold','Glimmer'],
   terrain:'A compact street grid loops around a canal, printing district, and courthouse. Alleys and rooftop pages open as the investigation advances; bridges remain physical gates.',
   scale:'Proposed city core: about 300 × 240 m with connected interior scenes.',effect:'Carbon copies peel apart; type rain settles into evidence; folded headlines become street bridges.',
   chapters:[
    C('A Crime in Future Tense','Station square and the newspaper streets','Prove the arrest notice was printed before the crime.','Dot joins the investigation and the shuttered district opens.',[
      N('Station arrival','Story','An impossible arrest notice names the Wayfarer. A visible alley leads out of the square.','Case notice in the story pouch.'),
      N('Notice ambush','Battle','Defeat two baton guards and a paper hound. Guard or dodge the stamp slam, then open the alley latch.','Evidence scrap.'),
      N('Dot’s office','Safe','Meet Dot and learn Turn on a safe carbon-copy page. The office becomes the city refuge.','Permanent Turn tool.',['Turn']),
      N('Three notice boards','Puzzle','Inspect front and reverse dates at three nearby boards; Glimmer shows faint type and Turn reveals the carbon impression.','Printing contradiction.',['contradiction'],['Turn','Glimmer']),
      N('Press alley','Battle','Fight a patrol on two intersecting lanes, or use the opened side gate after reading its latch clue.','Proof sheet.',['proof']),
      N('Case board','Puzzle','Place date, witness, and proof sheet in their matching slots. A wrong deduction exposes another clue and remains reversible.','Accusation disproved.',['case-one'],['contradiction','proof']),
      N('District bridge','Exit','The paper bridge unfolds to the printing district and a shortcut returns to Dot.','New district checkpoint.',[],['case-one'])
    ],[S(4,'The Shadow on Strike','Negotiate between a lamplighter and their independent shadow, then repair the shared lamp.','Carbon cloak; optional searchlight route.')],{shortcut:[7,3],shortcutLabel:'Office footbridge',gates:{'6-7':'Case board resolved'}}),
    C('The Witness Who Was a Footnote','Printing district and the city register','Restore the witness’s name and recover reverse-side star coordinates.','The witness chooses to testify; the city register remembers them.',[
      N('Press courtyard','Safe','Meet the printers. Their visible maintenance route leads toward the register.','Supply table.'),
      N('Typesetter patrol','Battle','Two ink bailiffs attack from separate lanes. Conveyor hazards show striped crease lines before moving.','Ink and repair paper.'),
      N('Footnote stair','Puzzle','Turn a footnote panel and Fold its enlarged margin into stairs. The witness can be seen at the bottom before descending.','Witness located.',['witness'],['Turn','Fold']),
      N('Quiet proof room','Story','Hear the witness’s account and obtain their chosen name. No combat occurs during testimony.','Witness statement.',['statement'],['witness']),
      N('Register engine','Battle','Defend the printer while disabling two red stamp arms. Ordinary local knots can be broken by any weapon.','Printer’s seal charm.'),
      N('Name register','Puzzle','Turn the locked register panel and match the statement to the correct line. Preserve the reverse-side coordinates in the story pouch.','Name restored; star coordinates.',['coordinates'],['Turn','statement']),
      N('Courthouse tram','Exit','Open the tram and a walkway back to the courtyard. Dot marks the court entrance.','Court checkpoint.',[],['coordinates'])
    ],[S(2,'A Name in Small Print','Recover three bylines in the district and defend their publication.','Citizen newspaper; optional trial witness.'),S(4,'The Case of the Missing Color','Follow pigment traces to the dye store and let a neighborhood choose its first mural.','Equipment dye; a later astronomer’s landing guide.')],{shortcut:[7,1],shortcutLabel:'Printer walkway',gates:{'5-6':'Witness statement'}}),
    C('The Trial of Tomorrow','Court plaza, docket rooms, and stamping courtroom','Disprove the charges and break Judge Full Stop’s binding.','The city gains an unwritten tomorrow and restores the lost catalogue entry.',[
      N('Court-plaza refuge','Safe','Review the case and equip gear. Required evidence is already in the protected story pouch.','Boss-route checkpoint.'),
      N('Bailiff steps','Battle','Fight shielded bailiffs on broad steps with two flanking landings.','Gold and tonics.'),
      N('Docket chambers','Puzzle','Turn three docket pages and expose the contradictions. Wrong placements return to the case tray.','Binding anchors identified.',['dockets'],['Turn','coordinates']),
      N('Witness antechamber','Safe','Hear the main witness, then open the side stair to the plaza. Optional witnesses add lines, not required evidence.','Court retry checkpoint.'),
      N('Full Stop’s court','Boss','Dodge the marked stamp lanes, strike during stamp recovery, then Turn an exposed docket anchor. Repeat without changing the truth of the ground warnings.','Judge’s control broken.',['judge-free'],['dockets','Turn']),
      N('Tomorrow’s press','Story','The citizens publish their first unwritten edition and return the catalogue entry.','Carbon Street bookmark; Margin Needle spear.',['bookmark-b3','catalogue'],['judge-free']),
      N('Second-shelf door','Exit','With the sea bookmark too, the campfire and star books open in either order.','Margin case desk.',[],['bookmark-b3'])
    ],[],{shortcut:[4,1],shortcutLabel:'Witness side stair',gates:{'4-5':'Dockets resolved'}})
   ]},
  {id:'b4',number:'IV',title:'The Thirteenth Campfire',shape:'camp',refuge:'Twelve-stool camp',entry:'Free Books II and III. Play this book and Book V in either order.',requires:['Fold','Glimmer','Stitch','Turn'],
   terrain:'Three tale clearings surround one persistent camp. Footprint woods lie west, the impossible cabin northeast, and the reflection lake south. Chapter 3 revisits these places before returning to the fire.',
   scale:'Proposed forest core: about 300 × 300 m; a 60 × 50 m folding cabin interior.',effect:'Punctuation embers, sentences in smoke, negative-space faces, and envelope tents. Rhythm clues have visible marks.',
   chapters:[
    C('The Footsteps That Follow','Western woods and an abandoned sign bridge','Find Rue and end the extra footsteps.','Rue writes her ending; a trail folds back to camp.',[
      N('Twelve-stool camp','Safe','Meet Keeper Cinder. A thirteenth shadow appears beside an empty stool; the safe fire refills ink.','Camp checkpoint.'),
      N('Hush clearing','Puzzle','Cinder teaches Hush: silence your own steps, then identify the extra rhythm through sound, ripples, and captions.','Hush learned.',['Hush']),
      N('Ink-print fork','Puzzle','Use Glimmer to distinguish fresh ink steps from old printed tracks. Hush isolates the following rhythm.','True trail found.',['true-trail'],['Glimmer','Hush']),
      N('Sign bridge','Battle','Fold a fallen sign into a bridge, then fend off soot Inklings while Rue crosses. The stable bridge remains after a retry.','Cinder coat.',[],['Fold','true-trail']),
      N('Footstep hollow','Battle','The Footstep Thief stamps twice before its accordion lunge. Dodge or guard, then break the notebook’s knot; the lantern circle also breaks pursuit.','Rue’s notebook.',['notebook']),
      N('Rue’s lantern','Story','Rue speaks her chosen last line. The extra footsteps stop and a name returns to a place card.','First ending restored.',['tale-one'],['notebook']),
      N('Folded camp trail','Exit','Open a short return to the fire and mark the cabin’s path.','Camp shortcut.',[],['tale-one'])
    ],[S(1,'The Marshmallow Knight','Fold a windbreak, turn a hinged fan, and help the tiny knight drive a soot moth away from the provisions.','Toasted-edge shield appearance; camp companion.'),S(2,'Letters Under the Sleeping Bag','Follow comma creatures to their nest and exchange folded shelter paper for Ivo’s stolen letters.','Decorated satchel; recovered invitations.')],{shortcut:[7,1],shortcutLabel:'Rue’s return trail',gates:{'3-4':'True ink trail'}}),
    C('The Cabin with One Window Too Many','Cabin exterior and two foldable rooms','Resolve the extra window and rescue its trapped storyteller.','The cabin becomes a safe shelter with matching windows.',[
      N('Cabin lantern','Safe','Cinder’s marker lets the player observe three outside windows before entering. Sketches persist in the journal.','Safe checkpoint.'),
      N('Porch shutters','Battle','A Window Guest slams a marked shutter after its eyelid crease closes. Survive or lure it aside to inspect the door.','Ink fragments.'),
      N('Four-window room','Puzzle','Compare the four inside frames with the exterior sketch. Turn the loose wall to find the extra window’s caption.','False window identified.',['false-window'],['Turn']),
      N('Moonlight room','Puzzle','Fold marked shutters to send moonlight to the true door; Stitch a torn floor. A safe reset handle restores the arrangement.','True door revealed.',['true-door'],['Fold','Stitch','false-window']),
      N('Speaking-tube nook','Story','Rescue the storyteller and learn Echo by replaying their selected knock at a marked tube.','Echo learned; Whisperwick focus.',['Echo'],['true-door']),
      N('Guest’s false frame','Puzzle','Replay the knock at the false window, close the flap, and escape. Melee can create breathing room but cannot solve the layout.','Cabin ending restored.',['tale-two'],['Echo','false-window']),
      N('Shelter back door','Exit','The back door opens to camp and the cabin becomes a refill point.','Permanent cabin shelter.',[],['tale-two'])
    ],[S(1,'The Lantern on the Lake','Turn the reflected map, Fold two reeds, and send a paper boat with an unanswered letter across the lake.','Reflected-lantern charm; a scout’s memorial.')],{shortcut:[7,1],shortcutLabel:'Cabin back path',gates:{'4-5':'Moonlight aligned','5-6':'Echo learned'}}),
    C('Don’t Let the Fire Learn Your Name','Three remembered clearings and the campfire ring','Return stolen names and break the binding beneath the empty stool.','The storytellers choose their endings and invite a real thirteenth guest.',[
      N('Ash-ring camp','Safe','The stolen names circle above the fire. Cinder marks three nearby name-fragment sites on the map.','Final tale checkpoint.'),
      N('Footprint name','Battle','Defeat a short soot patrol at Rue’s restored trail; Glimmer reveals the first name on the notebook cover.','Name fragment one.',['name-one'],['Glimmer']),
      N('Cabin name','Puzzle','Echo the chosen knock at the now-safe speaking tube. The correct name settles on the sill.','Name fragment two.',['name-two'],['Echo']),
      N('Lake name','Puzzle','Use Hush to still a ringing reed and read the letters in the reflection. This is on the main shore, independent of the optional lake quest.','Name fragment three.',['name-three'],['Hush']),
      N('Names at the fire','Puzzle','Match the three names to residents’ place cards using their symbols and testimony. The residents speak their own last lines.','Listener exposed.',['names-returned'],['name-one','name-two','name-three']),
      N('Listener in the Ash','Boss','Its listening head turns before a marked strike. Echo can lure it and Hush can interrupt its marked voice channel; ordinary attacks always expose melee openings.','Ashward charm; binding knot released.',['listener-free'],['names-returned']),
      N('The invited stool','Exit','Accept the signed bookmark and the recovered words of the House’s invitation. Cinder opens a Margin storytelling circle.','Campfire bookmark; invitation words.',['bookmark-b4','house-words'],['listener-free'])
    ],[],{edges:[[1,2],[1,3],[1,4],[2,5],[3,5],[4,5],[5,6],[6,7]],shortcut:[7,1],shortcutLabel:'Restored camp',gates:{'5-6':'All three names returned'}})
   ]},
  {id:'b5',number:'V',title:'The Clockwork Constellations',shape:'stars',refuge:'Jun’s observatory',entry:'Free Books II and III. Play this book and Book IV in either order.',requires:['Fold','Glimmer','Stitch','Turn'],
   terrain:'An observatory, an uncharted moon, and a factory planet sit on separate paper discs. Marked star bridges connect them; ships travel by authored page transitions.',
   scale:'Proposed three discs of 140–180 m diameter; a separate orbital boss platform.',effect:'Rotating chart layers, foil hulls, perforated star light, and mechanical paper blossoms.',
   chapters:[
    C('A Star Outside the Chart','Observatory launch route and an uncharted moon','Reveal the coordinates and launch Jun’s unapproved expedition.','An unknown moon reveals discarded binding machines.',[
      N('Jun’s observatory','Safe','Meet Jun and inspect the broken star route. Campfire magic is not required in this book.','Observatory refuge.'),
      N('Chart gallery','Puzzle','Turn the chart to expose Carbon Street’s coordinates, then Stitch the sea thread to its marked star anchors.','Launch path.',['launch-path'],['Turn','Stitch']),
      N('Launch ramp','Battle','Fight numbered scouts between foil crates; rotating antenna shadows indicate the next sweep.','Thread and repair paper.'),
      N('Exterior ship page','Battle','Cross a ship panel as it unfolds, fighting one shield scout at a time on stable deck sections.','Orbit boots.'),
      N('Moon landing','Safe','Anchor the return ship and open a refill lamp. There is always a fixed way back to the observatory.','Moon checkpoint.'),
      N('Prototype crater','Puzzle','Turn three machine labels and Fold their test panels to reconstruct a factory route.','Factory address.',['factory-address'],['Turn','Fold']),
      N('Factory star bridge','Exit','Stitch the marked route and cross the page seam to the factory planet.','Factory access.',[],['Stitch','factory-address'])
    ],[S(5,'The Smallest Moon','Repair the orbit of a loose moon mistaken for scrap, then ask its inhabitants where they want to travel.','Rare armor paper; a moving Margin landmark.')],{shortcut:[5,1],shortcutLabel:'Anchored return ship',gates:{'2-3':'Chart and thread aligned'}}),
    C('The Factory of Perfect Futures','Assembly floor and three machine locks','Recover Cut and free the numbered explorers.','The reset network releases the expedition.',[
      N('Service airlock','Safe','Observe the assembly floor through a safe window and mark the three locks.','Factory checkpoint.'),
      N('Stamping floor','Battle','Scouts attack in time with visibly marked stamp arms. Cover boxes are solid, and a side service lane remains open.','Gold and foil paper.'),
      N('Discarded tool bench','Puzzle','Turn the rejected prototype’s instructions and release its seam edge. Test Cut on a red master stitch in a safe frame.','Permanent Cut tool.',['Cut'],['Turn']),
      N('Lock gallery','Puzzle','Cut three marked red control stitches in any order, redirecting conveyors so rescued workers can leave.','Reset network disabled.',['locks'],['Cut']),
      N('Supervisor cradle','Battle','A heavy supervisor exposes its core after an overhead punch; rescue paths stay outside its attack circle.','Freed workers.',['workers'],['locks']),
      N('Unstamped station','Story','Jun finds records of Vellum’s first failed repair. Let the workers select their own routes.','House record.',['house-record'],['workers']),
      N('Orbital elevator','Exit','Open the elevator and a maintenance lift back to the airlock.','Orbital approach.',[],['house-record'])
    ],[S(4,'The Robot Who Wanted a Name','Escort a scout through three jobs and record the name it chooses.','Chosen-name charm; optional machine-route ally.'),S(6,'Signals From the Endpaper','Turn chart panels and Stitch a rescue capsule to reach a stranded keeper.','Optional testimony about Vellum; a rescued resident.')],{shortcut:[7,1],shortcutLabel:'Maintenance lift',gates:{'3-4':'Cut learned'}}),
    C('An Orbit of Our Own','Orbital lanes around the Celestial Engine','Break the engine’s control while preserving the explorers’ routes.','Jun locates the sealed House spine and opens a Margin planetarium.',[
      N('Elevator shelter','Safe','Preview three orbital lanes, rest, and change equipment.','Boss-route checkpoint.'),
      N('Outer orbit','Battle','Fight two sentries on a broad ring while one clearly marked beam crosses an empty lane.','Tonics and foil paper.'),
      N('Star-route anchors','Puzzle','Stitch a broken platform, Fold cover at its crease, then Cut the ring’s first master stitch.','Engine approach stable.',['orbit-route'],['Stitch','Fold','Cut']),
      N('Inner observatory','Safe','Activate a return lift. The engine’s rotation can be watched safely before entry.','Boss retry checkpoint.'),
      N('Celestial Engine','Boss','Read its raised instrument arms, dodge the orbital sweep, and strike the exposed core. Cut control threads only during recovery.','Engine freed.',['engine-free'],['orbit-route','Cut']),
      N('Unapproved horizon','Story','The explorers choose their next destination. Jun marks the House’s physical location.','Star bookmark; Starfoil coat.',['bookmark-b5','house-location'],['engine-free']),
      N('Planetarium seam','Exit','If the campfire invitation is also recovered, the House opens. Otherwise return to its book from the Margin.','Margin planetarium.',[],['bookmark-b5'])
    ],[],{shortcut:[4,1],shortcutLabel:'Observatory lift',gates:{'4-5':'Orbital route stable'}})
   ]},
  {id:'b6',number:'VI',title:'The House of Last Lights',shape:'house',refuge:'Miss Hem’s vestibule',entry:'Free Books IV and V: invitation words plus the House location.',requires:['Fold','Glimmer','Stitch','Turn','Hush','Echo','Cut'],
   terrain:'A courtyard and three wings share one returning vestibule. Chapter 2 exposes the damaged reverse of those rooms; Chapter 3 opens real exits through the repeating plan.',
   scale:'Proposed house: about 180 × 150 m, with a 100 m memorial garden.',effect:'Vellum portraits, doubled corridors, hinged rooms, and warm lamps behind patched paper.',
   chapters:[
    C('Guests Who Cannot Leave','Vestibule, portrait wing, and guest corridor','Collect the guests’ accounts and expose the imposed repetition.','Miss Hem recognizes that the guests need a future beyond the copied evening.',[
      N('Miss Hem’s vestibule','Safe','The invitation opens the front door. Miss Hem marks three occupied rooms and the stable return corridor.','House refuge.'),
      N('Repeating hall','Battle','Folded hosts repeat a bow before striking. Break their ordinary ribbons and the hall stops resetting for this visit.','Repair cloth-paper.'),
      N('Invitation rooms','Puzzle','Compare three invitations using Turn and Glimmer. Each remembers a different moment; no guest’s account is discarded.','Three accounts.',['accounts'],['Turn','Glimmer']),
      N('Guest alcove','Story','Hear the survivors and let one move their own chair, creating the first break in the repeated staging.','Remembrance focus.',['choice'],['accounts']),
      N('Portrait crossing','Battle','Protect the moving guest from two copy-hosts while leaving their chosen route open.','Resident relocated.',['guest-safe']),
      N('House register','Puzzle','Match the accounts to room symbols and identify the damaged evening’s missing page.','Memory wing identified.',['memory-wing'],['accounts','choice']),
      N('Memorial stair','Exit','Open the stair and an unlocked door back to the vestibule.','Memory-wing checkpoint.',[],['memory-wing'])
    ],[S(3,'The Portrait That Refused to Smile','Recover a portrait’s fragments and restore the subject’s chosen expression.','Gallery room; portrait equipment dye.'),S(4,'A Bed for the Boogeyman','Fold soft backing paper into a bed and negotiate a room for a creature tired of frightening children.','Rest alcove; optional evacuation guardian.')],{shortcut:[7,1],shortcutLabel:'Vestibule side door',gates:{'6-7':'Accounts matched'}}),
    C('The Night the Page Tore','Memory wing and Ada’s evacuation route','Understand Ada’s choice and hold open the remembered route.','The truth of Vellum’s loss becomes clear without recreating Ada.',[
      N('Memory landing','Safe','Pip identifies ink beneath the repairs. Required testimony is available even if earlier side quests were skipped.','Memory checkpoint.'),
      N('Three remembered rooms','Puzzle','Turn repaired panels and use Glimmer to order events by visible damage and residents’ accounts.','Evening reconstructed.',['memory'],['Turn','Glimmer']),
      N('Keeper’s cabinet','Story','Recover Ada’s surviving bookmark. Practice Hold on one harmless falling page at the cabinet.','Permanent Hold tool; Ada’s bookmark.',['Hold'],['memory']),
      N('Torn corridor','Puzzle','Hold a marked page open and Stitch the edge of a stable walkway. Release only after everyone reaches the landing.','Evacuation route opened.',['evac-route'],['Hold','Stitch']),
      N('Copy-host pursuit','Battle','Fight two copy-hosts across a stable landing while the next corridor visibly prepares to fold. No attack requires remaining on a collapsing tile.','Memory route secured.',['memory-safe']),
      N('Ada’s last lamp','Story','Hear the completed account. Vellum offers a flawless copy; the surviving residents explain what would be lost in accepting it.','Truth recorded.',['truth'],['evac-route','memory-safe']),
      N('Living-wing door','Exit','Hold the first real exit open and return to Miss Hem through a new stair.','Final house route.',[],['Hold','truth'])
    ],[S(6,'Pip’s Last Lantern','Use the orchard witness or the house register to light a memorial lamp that honors Ada.','Lantern appearance; warm Margin room.')],{shortcut:[7,1],shortcutLabel:'Memory stair',gates:{'3-4':'Hold learned'}}),
    C('A Door Left Open','Living wing, changing ballroom, and garden exits','Defeat the Last Host and let the survivors leave at their own pace.','The House keeps a memorial and opens new homes; the Press becomes reachable.',[
      N('Living-wing refuge','Safe','Assign no endings to the guests; listen to where each wants to go. Rest before the ballroom.','Boss-route checkpoint.'),
      N('Locked exit hall','Battle','Break the guards’ local knots and cut a marked master stitch on the door after combat.','Exit hall cleared.',[],['Cut']),
      N('Three exit panels','Puzzle','Hold stable panels and Fold ramps toward the residents’ chosen destinations. A fixed walkway connects the controls.','Safe exits.',['house-exits'],['Hold','Fold']),
      N('Garden antechamber','Safe','Open a garden door to the refuge. Inspect the ballroom’s room-changing attack before stepping inside.','Boss retry checkpoint.'),
      N('The Last Host','Boss','The mannequin raises its room model before a marked fold attack. Hold the safe page, strike its seam, and Cut the exposed red binding.','Host released.',['host-free'],['Hold','Cut','house-exits']),
      N('House’s final page','Story','Miss Hem and the residents choose what remains a memorial and what becomes home.','House bookmark; Hemstitched charm.',['bookmark-b6'],['host-free']),
      N('Binding Press breach','Exit','The six signed bookmarks and Ada’s bookmark open the final volume from the Margin.','Final volume unlocked.',[],['bookmark-b6','Hold'])
    ],[],{shortcut:[4,1],shortcutLabel:'Garden door',gates:{'4-5':'Three exits stable'}})
   ]},
  {id:'b7',number:'Final',title:'The Book of One Ending',shape:'finale',refuge:'Margin staging desk',entry:'Free all six books and recover Ada’s bookmark.',requires:['Fold','Glimmer','Stitch','Turn','Cut','Hold','Hush','Echo'],
   terrain:'A harbor-court, castle-star bridge, and haunted print floor are forced into one volume. Six binding spines converge beneath Vellum’s throne; the Margin remains the evacuation destination.',
   scale:'Proposed three connected sets of about 180 × 140 m; a 50 m final arena.',effect:'Incompatible paper layers tear at their joins; liberated letters replace repeated portraits of the wizard.',
   chapters:[
    C('Every Road Leads to Me','Forced genre crossroads and the unwritten margin route','Reach the Press without following Vellum’s prescribed road.','An independent route reaches the evacuation machinery.',[
      N('Margin staging desk','Safe','Review equipment, refill supplies, and hear the six main-story allies. Optional allies add help without replacing required routes.','Final expedition checkpoint.'),
      N('Harbor courthouse','Battle','Fight a mixed guard group among deck rails and court benches. The familiar attack tells carry across the genre mash.','Supplies.'),
      N('Decree road','Puzzle','Fold the road around one decree and Turn another to expose its omitted clause. The written lie never changes attack markers.','Unwritten route.',['unwritten'],['Fold','Turn']),
      N('Castle-star seam','Puzzle','Stitch a gap between a battlement and a chart platform, then Hold the landing while crossing.','Cross-book bridge.',['crossing'],['Stitch','Hold']),
      N('Throne decoy','Battle','Defeat the false throne’s guards and Cut its master control thread. A visible side path leads onward.','Decoy disabled.',['decoy'],['Cut']),
      N('Printers’ alcove','Safe','Rescued printers repair the landing and open a shortcut to the staging desk.','Rest and refill.'),
      N('Press overlook','Exit','View the three evacuation passages and six binding spines before entering the next chapter.','Press checkpoint.',[],['unwritten','crossing','decoy'])
    ],[S(2,'The Names in the Credits','Rescue displaced printers from a falling credits roll and return their bylines to their books.','Walkable epilogue credits gallery.'),S(4,'The Patchwork Banner','Let residents attach the repaired scraps from completed earlier stories to a common banner.','Patchwork banner appearance; no required upgrade.')],{shortcut:[6,1],shortcutLabel:'Printers’ landing',gates:{'6-7':'Unwritten route secured'}}),
    C('The Library That Fought Back','Three evacuation passages and six binding spines','Evacuate the residents and release all six book bindings.','The Press loses its hold on the library; the throne is exposed.',[
      N('Press control refuge','Safe','Choose any evacuation branch first. Every branch has main-story helpers and a guaranteed route back.','Control-room checkpoint.'),
      N('Sea and city passage','Battle','Defend evacuees on a stitched pier, Hold the exit page, then Cut the sea and city binding lines after the crowd clears.','Two bindings released.',['bindings-a'],['Stitch','Hold','Cut']),
      N('Camp and House passage','Puzzle','Use Glimmer to follow the true exit marks and Hold the shelter page. Cut its two bindings after the residents reach the Margin.','Two bindings released.',['bindings-b'],['Glimmer','Hold','Cut']),
      N('Kingdom and star passage','Battle','Fold cover for a short defense and Stitch the last ramp. Hold the exit, then Cut the final two binding lines.','Two bindings released.',['bindings-c'],['Fold','Stitch','Hold','Cut']),
      N('Six-spine junction','Puzzle','Confirm all six resident signals and release the central clamp. The gate requires all three branches, in any order.','Press disabled.',['press-free'],['bindings-a','bindings-b','bindings-c']),
      N('Allies’ last camp','Safe','Full refill and gear review before the final fight. No last-minute rare item is required.','Final boss checkpoint.'),
      N('Author’s stair','Exit','Climb the exposed stair to Vellum’s arena. The return lift stays available before the duel.','Throne access.',[],['press-free'])
    ],[S(1,'One Last Delivery','Carry replies from completed Ivo deliveries along the evacuation route. Missing optional letters remain absent.','Invitation wall in the epilogue.')],{edges:[[1,2],[1,3],[1,4],[2,5],[3,5],[4,5],[5,6],[6,7]],shortcut:[6,1],shortcutLabel:'Evacuation lift',gates:{'5-6':'All six bindings released'}}),
    C('The Right to the Next Page','The Author’s arena and shared writing desk','Defeat Vellum and return the pen to the library’s people.','An open epilogue preserves every book’s freedom.',[
      N('Last bookmark','Safe','Rest and compare the final loadout. Retry returns here with gear, tools, and story progress intact.','Final checkpoint.'),
      N('Roles he assigns','Battle','A short opening exchange repeats the familiar guard and dodge lessons. The quill staff visibly charges before striking.','No random loot gate.'),
      N('Folded decree floor','Puzzle','Fold one wall, Turn a false route, and Stitch a safe seam between phases. Solved stage changes persist within the attempt.','Arena opened.',['arena'],['Fold','Turn','Stitch']),
      N('Vellum’s throne','Boss','Hold a stable page against the fold, punish committed melee attacks, then Cut exposed master threads. Wordcraft offers extra tactics; physical openings always remain.','Vellum defeated.',['vellum-free'],['arena','Hold','Cut']),
      N('The freed pen','Story','Pick up the pen after the duel. It enters the protected story pouch, never a weapon slot.','Shared pen.',['shared-pen'],['vellum-free']),
      N('Shared writing desk','Story','Place the pen at the common desk. Residents decide their next pages; choose the Wayfarer’s own future.','Campaign resolution.',['ending'],['shared-pen']),
      N('An unwritten page','Exit','Revisit the freed books, finish optional stories, and see the repairs and friendships recorded in the world.','Epilogue exploration.',[],['ending'])
    ],[],{gates:{'4-5':'Vellum defeated'},shortcut:[7,1],shortcutLabel:'Epilogue revisit'})
   ]}
];

// Materialize stable IDs, local routes, and spatial positions for all 21 chapters.
for (const book of books) {
  let learned = new Set(book.requires);
  const carriedFlags = new Set(book.requires);
  book.chapters.forEach((chapter, index) => {
    chapter.id = `${book.id}-c${index+1}`;
    chapter.number = index+1;
    chapter.requires = [...learned];
    chapter.startFlags = [...carriedFlags];
    const positions = layouts[book.shape].map(p=>[...p]);
    if (chapter.edges?.length === 8) positions.splice(0,7,[16,50],[42,18],[42,50],[42,82],[69,50],[86,24],[86,80]);
    chapter.nodes = chapter.nodes.map((n,i)=>({...n,id:i+1,x:positions[i][0],y:positions[i][1]}));
    chapter.edges = (chapter.edges || [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]).map(([a,b])=>({a,b,type:'main',gate:chapter.gates?.[`${a}-${b}`]||''}));
    for(const side of chapter.sides){
      const candidates=[[12,15],[45,89],[85,11],[58,49],[12,52],[86,51],[55,12],[61,87]];
      const distance=p=>Math.min(...chapter.nodes.map(n=>Math.hypot((p[0]-n.x)*1.35,p[1]-n.y)));
      const position=side.position||candidates.sort((a,b)=>distance(b)-distance(a))[0];
      const node={...side,id:chapter.nodes.length+1,x:position[0],y:position[1]};
      chapter.nodes.push(node);chapter.edges.push({a:side.at,b:node.id,type:'optional',gate:'Optional; return to the same junction'});
    }
    if(chapter.shortcut)chapter.edges.push({a:chapter.shortcut[0],b:chapter.shortcut[1],type:'shortcut',gate:chapter.shortcutLabel});
    for(const n of chapter.nodes)for(const grant of n.grants){carriedFlags.add(grant);if(['Fold','Glimmer','Stitch','Turn','Hush','Echo','Cut','Hold'].includes(grant))learned.add(grant);}
    delete chapter.sides;
  });
}

export const supportMaps = [
  {id:'prologue',title:'A Tear in the Margin',ground:'Mara’s folding repair workshop',goal:'Take up the blade, rescue Pip and Ivo, and reach the bookmark door.',outcome:'The Wayfarer enters Book I with essential companions and starter equipment.',requires:[],nodes:[
    {...N('Mender’s desk','Safe','Mara cuts the Wayfarer from blank endpaper. Movement unfolds the first strip of floor.','Blank satchel; patched coat; travel boots.'),id:1,x:15,y:70},
    {...N('Letter opener','Reward','Pick up and equip the blade in the required weapon tutorial.','Wayfarer’s blade.'),id:2,x:40,y:70},
    {...N('Binding strike','Battle','Guard and dodge one clearly marked strike, then defeat the simple ink command.','First repair paper.'),id:3,x:65,y:70},
    {...N('Pip’s dark lamp','Puzzle','Turn the lamp’s handle, freeing Pip and causing a small stair to unfold.','Blank lantern; Pip rescued.'),id:4,x:65,y:32},
    {...N('Ivo’s envelope','Puzzle','Open the indicated seal with the blade and help Ivo out.','Ivo rescued.'),id:5,x:40,y:32},
    {...N('Bookmark doorway','Exit','Both companions must be rescued before Mara opens the exit.','Book I entry.'),id:6,x:15,y:32}
  ],edges:[{a:1,b:2,type:'main'},{a:2,b:3,type:'main'},{a:3,b:4,type:'main'},{a:4,b:5,type:'main'},{a:5,b:6,type:'main',gate:'Pip and Ivo rescued'}]},
  {id:'margin',title:'The Margin',ground:'Persistent refuge between the books',goal:'Rest, equip, upgrade, review quests, and select an available book.',outcome:'Every freed world adds a room or resident; core facilities are available after Book I.',requires:['Book I freed'],nodes:[
    {...N('Shared desk','Safe','Central arrival, save, and return point. All chapter bookmarks lead here without losing quest state.','Rest and refill.'),id:1,x:50,y:50},
    {...N('Mara’s workbench','Safe','Upgrade equipment with named paper materials and gold; inspect a reversible comparison before confirming.','Upgrades and free equipment changes.'),id:2,x:18,y:22},
    {...N('Ivo’s mail wall','Story','Review delivered letters and claim any recovered one-time rewards.','Correspondence and keepsakes.'),id:3,x:18,y:78},
    {...N('Pip’s wordbook','Safe','Read learned words, set two combat spells, and practice on harmless puzzle fixtures.','No cost practice casts.'),id:4,x:50,y:15},
    {...N('Book shelves','Exit','Sea and city follow Book I; both open camp and stars; both then open the House; six bookmarks open the finale.','Book selection.'),id:5,x:83,y:25},
    {...N('Residents’ rooms','Story','Ferry, case desk, campfire circle, planetarium, and memorial grow as the corresponding books are freed.','Visible campaign consequences.'),id:6,x:83,y:76}
  ],edges:[2,3,4,5,6].map(b=>({a:1,b,type:'main'}))}
];

export const atlas = {version:1,status:'Design draft; not playable levels',legend:{main:'Required route; marker order indicates first-time progression',optional:'Optional side story; dashed connection',shortcut:'Return shortcut opened from the far side; dotted connection'},books,supportMaps};
