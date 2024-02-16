export default class MapName {
  static mapId = 0;

  // Predefined map
  static mapIdToName = {
    0: "Azeroth", // Eastern Kingdoms
    1: "Kalimdor", // Kalimdor
    29: "pvpzone04", // Arathi basin
    30: "pvpzone01", // Alterac valley
    489: "pvpzone03", // WSG
    530: "expansion01", // Outland
    566: "netherstormbg", // Eye of the Storm
    571: "Northrend", // Northrend
  };

  static getMapName(id = MapName.mapId) {
    return MapName.mapIdToName[id] || "Azeroth"; // Default to Azeroth
  }
}
