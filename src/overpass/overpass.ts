import { Element, Node, Way } from "./api/element";
import { Location } from "../models/location";
import { Selection } from "../models/selection";

class Overpass {
  public static async queryOverpass(selection: Selection): Promise<Location[]> {
    const boundingBox = [
      selection.minimumLatitude,
      selection.minimumLongitude,
      selection.maximumLatitude,
      selection.maximumLongitude,
    ];
    const query = `
            [out:json][timeout:25];
            (
                node["addr:postcode"]["addr:city"]["addr:street"]["addr:housenumber"](${boundingBox});
                way["addr:postcode"]["addr:city"]["addr:street"]["addr:housenumber"](${boundingBox});
            );
            out body center;
            >;
            out skel qt;
        `;
    const response = await fetch("https://overpass-api.de/api/interpreter?data=" + query);
    const json = await response.json();

    return json["elements"]
      .map((element: Element) => this.locationFromElement(element))
      .filter((location: Location) => location);
  }

  private static locationFromElement(element: Element) {
    // Node elements may not contain the required tags
    if (!("tags" in element)) return;

    let latitude, longitude;
    switch (element.type) {
      case "way":
        latitude = (element as Way).center.lat;
        longitude = (element as Way).center.lon;
        break;

      case "node":
        longitude = (element as Node).lon;
        latitude = (element as Node).lat;
        break;

      default:
        return;
    }

    // If there are multiple numbers, e.g. '12b,12c', '5-7', or '44;45' just take the first one
    element.tags["addr:housenumber"] = element.tags["addr:housenumber"]
      .split(",")[0]
      .split("-")[0]
      .split(";")[0];

    return new Location(
      element.tags["addr:postcode"],
      element.tags["addr:city"],
      element.tags["addr:street"],
      element.tags["addr:housenumber"],
      latitude,
      longitude
    );
  }
}

export { Overpass };
