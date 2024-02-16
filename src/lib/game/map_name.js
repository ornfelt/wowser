export default class MapName {
  static mapId = 0;

  // Predefined map
  static mapIdToName = {
    0: "Azeroth",
    1: "Kalimdor",
    30: "PVPZone01",
    530: "Expansion01",
    571: "Northrend",
  };

  static getMapName(id = MapName.mapId) {
    return MapName.mapIdToName[id] || "Azeroth"; // Default to Azeroth
  }
}
