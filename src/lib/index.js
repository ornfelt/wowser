import EventEmitter from 'events';

import Config from './config';
import GameHandler from './game/handler';
import Player from './game/player';
import PlayerTwo from './game/playertwo';
import Spell from './game/spell';
import WorldHandler from './game/world/handler';

class Client extends EventEmitter {

  constructor(config) {
    super();

    this.config = config || new Config();
    this.game = new GameHandler(this);
    this.player = new Player();
    this.playertwo = new PlayerTwo();
    this.spell = new Spell();

    const displayIDs = [
      //{ id: 19272, name: "Nether drake" }, // Used as default playertwo
      //{ id: 17890, name: "Ashes of Al'ar" },
      //{ id: 24101, name: "Proto drake" },
      //{ id: 24725, name: "Nether Dragon" },
      //{ id: 8570, name: "Onyxia" },
      //{ id: 21137, name: "Illidan" },
      //{ id: 11121, name: "Ragnaros" },
      //{ id: 11380, name: "Nefarian" },
      //{ id: 24949, name: "Arthas regular" },
      { id: 22234, name: "lich king" },
      //{ id: 22235, name: "lich king no helmet" },
      //{ id: 24213, name: "lich king large" },
      //{ id: 24191, name: "lich king larger" },
      { id: 25488, name: "Sindragosa" },
      //{ id: 18945, name: "Al'ar" },
      //{ id: 10992, name: "Mini Diablo" },
      //{ id: 24803, name: "UndeadBeast" },
      //{ id: 25014, name: "Frost Wyrm" },
      //{ id: 25015, name: "Fire Wyrm" },

      //{ id: 24794, name: "Mounted DK" },
      //{ id: 24743, name: "Frost Dragon" },
      //{ id: 23747, name: "NetherDragonPurple" },

      //{ id: 25033, name: "Dranei Pirate" },
      //{ id: 25034, name: "Dwarf Pirate" },
      //{ id: 25035, name: "Gnome Pirate" },
      //{ id: 25037, name: "Human Pirate" },
      //{ id: 25038, name: "Night Elf Pirate" },
      //{ id: 25039, name: "Orc Pirate" },
      //{ id: 25040, name: "Tauren Pirate" },
      //{ id: 25041, name: "Troll Pirate" },
      //{ id: 25042, name: "Undead Pirate" },
    ];

    const spellNames = [
      "spells\\meteor_ball_missile.m2", // Cool (used as default spell)
      //"spells\\blizzard_impact_base.m2", // Should be placed somewhere

      "spells\\frostbolt.m2",
      "spells\\shaman_thunder.m2",
      //"spells\\chainlightning_fel_impact_chest.m2",
      "spells\\chainlightning_impact_chest.m2",
      "spells\\firebomb_missle.m2", // Like a sun
      //"spells\\lightningbolt_missile.m2",
      //"spells\\groundspike_impact.m2",
      //"spells\\icespike_impact_new.m2",
      //"spells\\rag_firenova_area.m2",
      "spells\\lightning_ring_nova.m2",

      //"spells\\fireball_missile_high.m2",
      //"spells\\pyroblast_missile.m2",
      //"spells\\ice_missile_high.m2",
      //"spells\\waterbolt_missile_low.m2",
      //"spells\\fire_form_precast.m2",

      //"spells\\firenova_area.m2",
      //"spells\\ice_nova.m2", // Crazy big
      //"spells\\missile_wave_arcane.m2",
      //"spells\\missile_wave_fire.m2",
      //"spells\\arcaneexplosion_base.m2",
      //"spells\\arcanebomb_missle.m2",
      //"spells\\shadow_nova_area.m2",
      //"spells\\water_nova.m2",

      //"spells\\fireball_blue_missile_high.m2",
      //"spells\\fel_fireball_missile_high.m2",
      //"spells\\fel_firebolt_missile_low.m2",
      //"spells\\fel_pyroblast_missile.m2",
      //"spells\\firebolt_missile_low.m2",
      //"spells\\missile_bomb.m2", // Small...
    ];

    //const player_list = [];
    //const spell_list = [];
    this.player_list = [];
    this.spell_list = [];

    displayIDs.forEach(player => {
      const newPlayer = new PlayerTwo(player.id);
      newPlayer.name = player.name;
      this.player_list.push(newPlayer);
    });

    spellNames.forEach(spellName => {
      const newSpell = new Spell(spellName);
      this.spell_list.push(newSpell);
    });

    // Create this last
    this.world = new WorldHandler(this);

  }

}

export default Client;
