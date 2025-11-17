import { Carrier } from "./models/carrier";

const selectionWarningThreshold = 6_000_000;
const concurrency = 6;
const hexagonCellSide = 100;
const minimumSelectionZoomLevel = 13;
const proxies = ["https://corsproxy.io/?"];
const carriers: { [key: string]: Carrier } = {
  DTAG: new Carrier("Deutsche Telekom AG", "#e20074"),
  "1U1": new Carrier("1&1", "#003d8f"),
  VCN: new Carrier("Vitroconnect", "#009fe3"),
  ERROR: new Carrier("Error", "#000000"),
};

export {
  selectionWarningThreshold,
  concurrency,
  hexagonCellSide,
  minimumSelectionZoomLevel,
  proxies,
  carriers,
};
