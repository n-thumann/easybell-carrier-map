import { Feature, Polygon } from "@turf/helpers";
import { Location } from "./location";

class Hexagon {
  id: string;
  geometry: Feature<Polygon>;
  locations: Location[];

  constructor(geometry: Feature<Polygon>, locations: Location[]) {
    this.id = "hexagon-" + Math.random().toString();
    this.geometry = geometry;
    this.locations = locations;
  }
}

export { Hexagon };
