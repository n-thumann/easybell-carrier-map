import { Location } from "../models/location";
import { LocationResult } from "../models/locationResult";
import { ProviderAvailabilities } from "./api/providerAvailabilities";
import { carriers } from "../config";

class EasyBell {
  private static async getCarrierFromAddress(
    location: Location,
    urlPrefix = ""
  ): Promise<string | null> {
    const params = new URLSearchParams({
      exact_address: "false",
      zip_code: location.postcode,
      city: location.city,
      street: location.street,
      house_number: location.houseNumber,
    });

    const response = await fetch(
      urlPrefix + "https://www.easybell.de/api/provider-availabilities/TAL?" + params
      // Using this other endpoint also works with some adjustments, but it's slower and returns larger responses
      // /api/plan-address?zipCode=49074&city=Osnabr%C3%BCck&region=Osnabr%C3%BCck&houseNumber=10&street=Domhof
    );

    switch (response.status) {
      case 429: {
        // Due to missing CORS headers, we cannot read the X-Ratelimit-Reset header to calculate the
        // delay, so we'll just assume a delay of ten seconds.
        const delaySeconds = 10;

        console.debug(`Hit rate limit, retrying in ${delaySeconds} seconds`);
        await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1_000));

        return await this.getCarrierFromAddress(location, urlPrefix);
      }
      case 200: {
        const providerAvailabilities = (await response.json()) as ProviderAvailabilities;
        const results = providerAvailabilities.results.filter((result) => result.line == "vdsl");

        return results[0]?.carrier || null;
      }

      default:
        return null;
    }
  }

  public static async getCarrier(locations: Location[], urlPrefix?: string) {
    let errors = 0;
    for (const location of locations) {
      let carrier;
      try {
        carrier = await this.getCarrierFromAddress(location, urlPrefix);
      } catch (error) {
        errors++;
        continue;
      }

      if (!carrier) {
        console.debug(`Could not find carrier for ${location}`);
        continue;
      }

      if (!(carrier in carriers)) {
        console.warn(
          `Unknown carrier ${carrier}. Please report this to https://github.com/n-thumann/easybell-carrier-map/issues, thanks.`
        );
        continue;
      }

      const locationResult = new LocationResult(carriers[carrier], location);
      console.info(`Found carrier ${locationResult}`);
      return locationResult;
    }

    if (locations.length === errors) {
      console.debug(`Got errors for all locations`);
      return new LocationResult(carriers.ERROR, locations[0]);
    }

    return null;
  }
}

export { EasyBell };
