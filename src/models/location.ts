import { Feature, Point, Properties, point } from "@turf/helpers";

class Location implements Feature<Point> {
  type: "Feature" = "Feature" as const;
  geometry: Point;
  properties: Properties = {};

  postcode: string;
  city: string;
  street: string;
  houseNumber: string;

  public constructor(
    postcode: string,
    city: string,
    street: string,
    houseNumber: string,
    latitude: number,
    longitude: number
  ) {
    this.postcode = postcode;
    this.city = city;
    this.street = street;
    this.houseNumber = houseNumber;

    this.geometry = point([longitude, latitude]).geometry;
  }

  public toString() {
    return `${this.postcode} ${this.city}, ${this.street} ${this.houseNumber} (${this.geometry.coordinates[0]}, ${this.geometry.coordinates[1]})`;
  }
}

export { Location };
