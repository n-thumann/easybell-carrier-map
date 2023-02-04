# easybell-carrier-map

A map showing the carriers used by Easybell for their VDSL products

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/46975855/210180771-4ec19873-8b84-4b64-a385-08047771b96e.gif">
  <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/46975855/210180768-15df1025-4f4f-4ae2-8121-994341ccfde2.gif">
  <img alt="Demo of easybell-carrier-map" src="https://user-images.githubusercontent.com/46975855/210180771-4ec19873-8b84-4b64-a385-08047771b96e.gif">
</picture>

## Usage

Open https://n-thumann.github.io/easybell-carrier-map/, select area, wait, done.

## Running locally

Clone this repository, run `npm install`, run `npm run serve` to start the local development server or `npm run build` to build for production.

## How it works

1. Get the bounding box from the selected area
2. Query [Overpass](https://overpass-api.de/) for all addresses within the bounding box
3. Create hexagon grid inside bounding box
4. Assign addresses to corresponding hexagons
5. Sort addresses within each hexagon based on their distance to the hexagon's center (ascending distance)
6. Query Easybell availability API for every address in hexagon until a carrier has been found
7. Color hexagons on map based on carrier

## Quirks

- Not every address, especially in more rural areas, is available in OpenStreetMap. This can result in Overpass not returning any addresses for a hexagon, even though there are buildings in there.
- The Easybell API doesn't set CORS HTTP headers so that your browser can query it directly. Therefore, a CORS proxy is used. This is not needed when running locally.

## Background

Actually, I didn't build this to map Easybells carriers at all, but to visualize where 1&1 Versatel Layer 2 bitstream access is available. While playing around with Easybells availability API, I noticed that it also returns the carrier used, e.g. 1&1 Versatel.
My assumption is that in regions where 1&1 Versatel provides service to Easybell, they have L2-BSA available, which is in turn used for their own products (e.g. 1&1 DSL for consumers). I was able to confirm this assumption in multiple regions using e.g. RIPE Atlas nodes.
Because picking addresses at random and running e.g. `curl -s "https://www.easybell.de/api/provider-availabilities/TAL?exact_address=false&zip_code=49074&city=Osnabrück&street=Domhof&house_number=10" | jq -r ".results[0].carrier"` was a bit boring and lacked visualization, I built this project.

# Foo!