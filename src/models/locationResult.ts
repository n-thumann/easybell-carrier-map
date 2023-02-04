import { Carrier } from "./carrier";
import { Location } from "./location";

class LocationResult {
  carrier: Carrier;
  location: Location;

  constructor(carrier: Carrier, location: Location) {
    this.carrier = carrier;
    this.location = location;
  }

  public toString() {
    return `${this.carrier} @ ${this.location}`;
  }
}

export { LocationResult };
