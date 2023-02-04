import { Feature, Polygon } from "@turf/helpers";
import { BBox } from "@turf/helpers";
import { Hexagon } from "../models/hexagon";
import { Location } from "../models/location";
import { Point } from "@turf/helpers";
import { Selection } from "../models/selection";
import booleanWithin from "@turf/boolean-within";
import center from "@turf/center";
import distance from "@turf/distance";
import hexGrid from "@turf/hex-grid";
import { hexagonCellSide } from "../config";

class HexagonGrid {
  public readonly hexagons: Hexagon[] = [];

  public constructor(selection: Selection, locations: Location[]) {
    const boundingBox = [
      selection.minimumLongitude,
      selection.minimumLatitude,
      selection.maximumLongitude,
      selection.maximumLatitude,
    ] as BBox;

    const hexagonGrid = hexGrid(boundingBox, hexagonCellSide, { units: "meters" });

    for (const hexagonGeometry of hexagonGrid.features) {
      const locationsInHexagon = this.locationsInHexagon(hexagonGeometry, locations);
      const hexagon = new Hexagon(hexagonGeometry, locationsInHexagon);
      this.hexagons.push(hexagon);
    }
  }

  private locationsInHexagon(hexagon: Feature<Polygon>, locations: Location[]) {
    const locationsInHexagon = locations.filter((location) => booleanWithin(location, hexagon));

    const hexagonCenter = center(hexagon).geometry;
    return this.sortByDistance(hexagonCenter, locationsInHexagon) as Location[];
  }

  private sortByDistance(reference: Point, points: Feature<Point>[]) {
    const features = points.sort((a, b) => {
      const distanceHexagonCenterToA = distance(reference, a.geometry);
      const distanceHexagonCenterToB = distance(reference, b.geometry);

      return distanceHexagonCenterToA - distanceHexagonCenterToB;
    });

    return features;
  }
}

export { HexagonGrid };
