export default class MapName {
  static mapId = 0;

  // Predefined map
  static mapIdToName = {
    0: "Azeroth", // Eastern Kingdoms
    1: "Kalimdor", // Kalimdor
    30: "pvpzone01", // Alterac valley
	33: "shadowfang", // Shadowfang keep
	36: "deadminesinstance", // Deadmines
	37: "pvpzone02", // Azshara Crater
	47: "razorfenkraulinstance", // Razorfen Kraul
	169: "emeralddream", // Emerald Dream
	209: "tanarisinstance", // Zul'Farrak
	289: "schoolofnecromancy", // Scholomance
	309: "zul'gurub", // Zul'Gurub
	469: "blackwinglair", // Blackwing Lair
	489: "pvpzone03", // WSG
	509: "ahnqiraj", // Ruins of Ahn'Qiraj
	529: "pvpzone04", // Arathi basin
	530: "expansion01", // Outland
	531: "ahnqirajtemple", // Ahn'Qiraj Temple
	543: "hellfirerampart", // Hellfire Citadel: Ramparts
	559: "pvpzone05", // Nagrand arena
	566: "netherstormbg", // Eye of the Storm
	571: "Northrend", // Northrend
	601: "azjol_uppercity", // Azjol
	604: "gundrak", // Gundrak
	607: "northrendbg", // Strand of the Ancients
	608: "dalaranprison", // Violet Hold
	618: "orgrimmararena", // The Ring of Valor
	616: "nexusraid", // The Eye of Eternity
	617: "dalaranarena", // Dalaran Sewers
	624: "wintergraspraid", // Vault of Archavon
	632: "icecrowncitadel5man", // The Forge of Souls
	560: "hillsbradpast", // The Escape From Durnholde
	562: "bladesedgearena", // Blade's edge arena
	564: "blacktemple", // Black temple
	568: "zulaman", // Zul'Aman
	575: "utgardepinnacle", // Utgarde Pinnacle
	578: "nexus80", // The Oculus
	580: "sunwellplateau", // The Sunwell
	585: "sunwell5manfix", // Magister's Terrace
	595: "stratholmecot", // The Culling of Stratholme
	600: "draktheronkeep", // Drak'Tharon Keep
	602: "ulduar80", // Halls of Lightning
	603: "ulduarraid", // Ulduar
	615: "chamberofaspectsblack", // The Obsidian Sanctum
	619: "azjol_lowercity", // Ahn'kahet: The Old Kingdom
	628: "isleofconquest", // Isle of Conquest
	631: "icecrowncitadel", // Icecrown Citadel
	649: "argenttournamentraid", // Trial of the Crusader
	650: "argenttournamentdungeon", // Trial of the Champion
	658: "quarryoftears", // Pit of Saron
	599: "ulduar70", // Halls of Stone
	572: "pvplordaeron", // Ruins of Lordaeron
	574: "valgarde70", // Utgarde Keep
	723: "stormwind", // Stormwind
	724: "chamberofaspectsred", // The Ruby Sanctum
  };

  static getMapName(id = MapName.mapId) {
    return MapName.mapIdToName[id] || "Azeroth"; // Default to Azeroth
  }
}
