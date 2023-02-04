interface Element {
  type: string;
  tags: {
    "addr:postcode": string;
    "addr:city": string;
    "addr:street": string;
    "addr:housenumber": string;
  };
}

interface Node extends Element {
  lat: number;
  lon: number;
}

interface Way extends Element {
  center: {
    lon: number;
    lat: number;
  };
}

export { Element, Node, Way };
