import "./style.css";

import { Compliant, Selection } from "./models/selection";
import { CORSProxy } from "./easybell/corsProxy";
import { EasyBell } from "./easybell/easybell";
import { HexagonGrid } from "./map/hexagonGrid";
import { Map } from "./map/map";
import { Overpass } from "./overpass/overpass";
import { concurrency } from "./config";
import pLimit from "p-limit";

const map = new Map();
map.registerDrawCallback(onSearchArea);

async function onSearchArea(selection: Selection) {
  const compliance = selection.isCompliant();
  if (compliance == Compliant.TOO_SMALL) {
    alert("Please select a larger area.");
    map.clearDrawing();
    return;
  } else if (compliance == Compliant.TOO_BIG && !confirm("Large area selected, continue?")) {
    map.clearDrawing();
    return;
  }

  const locations = await Overpass.queryOverpass(selection);

  const grid = new HexagonGrid(selection, locations);
  map.addPendingHexagons(grid.hexagons);

  const limit = pLimit(concurrency);
  for (const hexagon of grid.hexagons) {
    limit(async () => {
      const proxy = CORSProxy.randomProxy();
      const result = await EasyBell.getCarrier(hexagon.locations, proxy);

      map.finishedLoadingHexagon(hexagon.id, result);
    });
  }
}
