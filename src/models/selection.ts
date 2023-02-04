import { hexagonCellSide, selectionWarningThreshold } from "../config";
import distance from "@turf/distance";

enum Compliant {
  TOO_SMALL,
  TOO_BIG,
  OK,
}

class Selection {
  public readonly minimumLatitude: number;
  public readonly minimumLongitude: number;
  public readonly maximumLatitude: number;
  public readonly maximumLongitude: number;

  constructor(
    minimumLatitude: number,
    minimumLongitude: number,
    maximumLatitude: number,
    maximumLongitude: number
  ) {
    this.minimumLatitude = minimumLatitude;
    this.minimumLongitude = minimumLongitude;
    this.maximumLatitude = maximumLatitude;
    this.maximumLongitude = maximumLongitude;
  }

  public isCompliant() {
    const width = distance(
      [this.maximumLatitude, this.minimumLongitude],
      [this.maximumLatitude, this.maximumLongitude],
      { units: "meters" }
    );
    const height = distance(
      [this.maximumLatitude, this.maximumLongitude],
      [this.minimumLatitude, this.maximumLongitude],
      {
        units: "meters",
      }
    );

    if (width * height > selectionWarningThreshold) return Compliant.TOO_BIG;

    // Stolen from https://stackoverflow.com/a/36881620
    const minimumWidth = hexagonCellSide * 2;
    const minimumHeight = ((hexagonCellSide * Math.sqrt(3)) / 2) * 3;

    if (width < minimumWidth || height < minimumHeight) return Compliant.TOO_SMALL;

    return Compliant.OK;
  }
}

export { Selection, Compliant };
