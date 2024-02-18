import EventEmitter from 'events';
import THREE from 'three';

import M2Blueprint from '../../pipeline/m2/blueprint';
import WorldMap from './map';

import MapName from '../map_name';

class WorldHandler extends EventEmitter {

  constructor(session) {
    super();
    this.session = session;
    this.player = this.session.player;

    this.scene = new THREE.Scene();
    this.scene.matrixAutoUpdate = false;

    this.map = null;

    this.changeMap = ::this.changeMap;
    this.changeModel = ::this.changeModel;
    this.changePosition = ::this.changePosition;

    this.entities = new Set();
    this.add(this.player);

    this.player.on('map:change', this.changeMap);
    this.player.on('position:change', this.changePosition);

    this.player.worldport(0, -10559, -1189, 28); // Darkshire (Eastern Kingdoms)
    //this.player.worldport(0, -14354, 518, 22); // Booty Bay (Eastern Kingdoms)
    //this.player.worldport(0, -4651, -3316, 296); // Stonewrought Dam (Eastern Kingdoms)
    //this.player.worldport(0, -4981.25, -881.542, 502.66); // Ironforge (Eastern Kingdoms)
    //this.player.worldport(1, 9947, 2557, 1316); // Darnassus (Kalimdor)
    //this.player.worldport(1, 2752, -348, 107); // Astranaar (Kalimdor)
    //this.player.worldport(1, 7827, -2425, 489); // Moonglade (Kalimdor)
    //this.player.worldport(1, -7183, -1394, -183); // Un'Goro Crater (Kalimdor)
    //this.player.worldport(1, 6721.44, -4659.09, 721.893); // Everlook (Kalimdor)
    //this.player.worldport(1, 2506.3, 1470.14, 263.722); // Stonetalon Mountains (Kalimdor)
    //this.player.worldport(1, -1828.913, -426.307, 6.299); // Mulgore (Kalimdor)
    //this.player.worldport(1, -1315.901, 138.6357, 302.008); // Thunderbluff (Kalimdor)
    //this.player.worldport(1, 6355.151, 508.831, 15.859); // Auberdine (Kalimdor)
    //this.player.worldport(530, -4013, -11894, -2); // The Exodar (Expansion 01)
    //this.player.worldport(530, -743.149, 8385.114, 33.435); // Nagrand (Expansion 01)
	//this.player.worldport(530, -241.43, 4571.33, 24.15); // Hellfire (Expansion 01)
    //this.player.worldport(530, 9152.441, -7442.229, 68.144); // Eversong Woods (Expansion 01)
    //this.player.worldport(571, 1031, -5192, 180); // Daggercap Bay (Northrend)
    //this.player.worldport(571, 5797, 629, 647); // Dalaran (Northrend)
	
	//this.player.worldport(30, 430.151, -80.831, 10.3); // Alterac Valley (PVPZone01)
	//this.player.worldport(33, -227.43, 2112.01, 76.88); // Shadowfang keep (shadowfang)
	//this.player.worldport(36, -39.96, -733.50, 9.88); // Deadmines (deadminesinstance)
	//this.player.worldport(37, -129.4, -92.7, 425.2); // Azshara Crater (pvpzone02)
	//this.player.worldport(209, 427.5, 604.1, 145.8); // Zul'Farrak
	//this.player.worldport(289, 199.42, 126.46, 134.91); // Scholomance (schoolofnecromancy)
	//this.player.worldport(309, -11916.09, -1239.40, 92.28); // Zul'Gurub (zul'gurub)
	//this.player.worldport(469, -7653.55, -1093.96, 404.18); // Blackwing Lair (blackwinglair)
	//this.player.worldport(489, 1123.4, 1466.4, 338.4); // WSG (pvpzone03)
	//this.player.worldport(509, -8441.63, 1519.94, 31.90); // Ruins of Ahn'Qiraj (ahnqiraj)
	//this.player.worldport(529, 766.151, 834.831, -37.3); // Arathi basin (PVPZone04)
	//this.player.worldport(543, -1348.61, 1651.06, 68.81); // Hellfire Citadel: Ramparts (hellfirerampart)
	//this.player.worldport(559, 4084.11, 2869.94, 12.10); // Nagrand arena (pvpzone05)
	//this.player.worldport(560, 2179.86, 145.185, 88.2163); // The Escape From Durnholde (hillsbradpast)
	//this.player.worldport(562, 6237.64, 260.659, 11.0744); // Blade's edge arena (bladesedgearena)
	//this.player.worldport(564, 97.68, 1002.60, -86.82); // Black temple (blacktemple)
	//this.player.worldport(566, 2019.9, 1541.6, 1206.1); // Eye of the Storm (netherstormbg)
	//this.player.worldport(568, 80.9, 1249.0, 56.6); // Zul'Aman (zulaman)
	//this.player.worldport(572, 1135.0, 1586.0, 33.79); // Ruins of Lordaeron (pvplordaeron)
	//this.player.worldport(574, 153.78, -86.54, 12.55); // Utgarde Keep (valgarde70)
	//this.player.worldport(575, 584.11, -327.97, 110.13); // Utgarde Pinnacle (utgardepinnacle)
	//this.player.worldport(578, 1045.9, 665.9, 203.7); // The Oculus (nexus80)
	//this.player.worldport(580, 1194.3, 579.7, 81.2); // The Sunwell (sunwellplateau)
	//this.player.worldport(585, 152.5, -205.1, 20.9); // Magister's Terrace (sunwell5manfix)
	//this.player.worldport(595, 1479.1, 473.92, 95.69); // The Culling of Stratholme (stratholmecot)
	//this.player.worldport(599, 1153.24, 806.16, 195.93); // Halls of Stone (ulduar70)
	//this.player.worldport(600, -517.34, -487.97, 11.01); // Drak'Tharon Keep (draktheronkeep)
	//this.player.worldport(601, 413.314, 795.968, 831.351); // Azjol nerub (azjol_uppercity)
	//this.player.worldport(602, 1331.47, 259.61, 53.39); // Halls of Lightning (ulduar80)
	//this.player.worldport(603, -897.4, -226.5, 566.8); // Ulduar (ulduarraid)
	//this.player.worldport(604, 1891.58, 832.713, 176.66); // Gundrak (gundrak)
	//this.player.worldport(607, 1461.6, -167.5, 52.3); // Strand of the Ancients (northrendbg)
	//this.player.worldport(608, 1808.81, 803.92, 44.36); // Violet Hold (dalaranprison)
	//this.player.worldport(615, 3228.5, 385.85, 65.5); // The Obsidian Sanctum (chamberofaspectsblack)
	//this.player.worldport(616, 731.38, 1325.8, 267.23); // The Eye of Eternity (nexusraid)
	//this.player.worldport(617, 1292.51, 792.05, 9.33); // Dalaran Sewers (dalaranarena)
	//this.player.worldport(618, 763.56, -273.9, 3.553); // The Ring of Valor (orgrimmararena)
	//this.player.worldport(619, 372.9, -791.8, 15.0); // Ahn'kahet: The Old Kingdom (azjol_lowercity)
	//this.player.worldport(624, -494.43, -102.6, 150.9); // Vault of Archavon (wintergraspraid)
	//this.player.worldport(628, 541.5, -843.0, 67.9); // Isle of Conquest (isleofconquest)
	//this.player.worldport(631, 76.86, 2211.37, 30.0); // Icecrown Citadel (icecrowncitadel)
	//this.player.worldport(632, 4917.53, 2191.29, 638.73); // The Forge of Souls (icecrowncitadel5man)
	//this.player.worldport(649, 424.6, 673.0, 550.9); // Trial of the Crusader (argenttournamentraid)
	//this.player.worldport(650, 424.6, 673.0, 550.9); // Trial of the Champion (argenttournamentdungeon)
	//this.player.worldport(658, 538.0, 165.5, 590.2); // Pit of Saron (quarryoftears)
	//this.player.worldport(723, -8878.69, 582.45, 92.99); // Stormwind (stormwind)
	//this.player.worldport(724, 3106.0, 418.5, 156.2); // The Ruby Sanctum (chamberofaspectsred)
	
	// Not working
	//this.player.worldport(47, 1943.79, 1548.74, 82.35); // Razorfen Kraul (razorfenkraulinstance)
	//this.player.worldport(169, 1326.5, 1496.0, 87.7); // Emerald Dream (emeralddream)
	//this.player.worldport(531, -8381.0, 1880.2, 200.6); // Ahn'Qiraj Temple (ahnqirajtemple)
  }

  add(entity) {
    this.entities.add(entity);
    if (entity.view) {
      this.scene.add(entity.view);
      entity.on('model:change', this.changeModel);
    }
  }

  remove(entity) {
    this.entity.delete(entity);
    if (entity.view) {
      this.scene.remove(entity.view);
      entity.removeListener('model:change', this.changeModel);
    }
  }

  renderAtCoords(x, y) {
    if (!this.map) {
      return;
    }
    this.map.render(x, y);
  }

  changeMap(mapID) {
    MapName.mapId = mapID;
    WorldMap.load(mapID).then((map) => {
      if (this.map) {
        this.scene.remove(this.map);
      }
      this.map = map;
      this.scene.add(this.map);
      this.renderAtCoords(this.player.position.x, this.player.position.y);
    });
  }

  changeModel(_unit, _oldModel, _newModel) {
  }

  changePosition(player) {
    this.renderAtCoords(player.position.x, player.position.y);
  }

  animate(delta, camera, cameraMoved) {
    this.animateEntities(delta, camera, cameraMoved);

    if (this.map !== null) {
      this.map.animate(delta, camera, cameraMoved);
    }

    // Send delta updates to instanced M2 animation managers.
    M2Blueprint.animate(delta);
  }

  animateEntities(delta, camera, cameraMoved) {
    this.entities.forEach((entity) => {
      const { model } = entity;

      if (model === null || !model.animated) {
        return;
      }

      if (model.receivesAnimationUpdates && model.animations.length > 0) {
        model.animations.update(delta);
      }

      if (cameraMoved && model.billboards.length > 0) {
        model.applyBillboards(camera);
      }

      if (model.skeletonHelper) {
        model.skeletonHelper.update();
      }
    });
  }

}

export default WorldHandler;
