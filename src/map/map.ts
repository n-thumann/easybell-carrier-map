import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import {
  AttributionControl,
  FillLayerSpecification,
  FillStyleLayer,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import { ButtonControl } from "./buttonControl";
// @ts-ignore: Missing type definitions for mapbox-gl-draw-rectangle-mode
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";
import { Hexagon } from "../models/hexagon";
import { LayerMetadata } from "./layerMetadata";
import { LocationResult } from "../models/locationResult";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Selection } from "../models/selection";
import { minimumSelectionZoomLevel } from "../config";

const GRAY = "#bdc3c7";

class Map {
  private readonly map: maplibregl.Map;
  private readonly draw: MapboxDraw;
  private readonly popup: maplibregl.Popup;
  private pendingAnimationInterval = 0;

  public constructor() {
    const style = window?.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark-matter"
      : "positron";
    this.map = new MapLibreMap({
      container: "map",
      style: `https://tiles.basemaps.cartocdn.com/gl/${style}-gl-style/style.json`,
      center: [8.04454, 52.274962],
      zoom: 14.9,
      maxZoom: 18,
      minZoom: 6,
      attributionControl: false,
    });

    this.popup = new Popup({
      closeButton: false,
      closeOnClick: true,
    });

    const modes = {
      ...MapboxDraw.modes,
      draw_rectangle: DrawRectangle,
    };

    this.draw = new MapboxDraw({
      modes: modes,
      displayControlsDefault: false,
    });
    // @ts-ignore: Type definitions of MapBox and MapLibre don't match, works anyways
    this.map.addControl(this.draw);

    const navigationControl = new NavigationControl({
      showCompass: false,
    });
    this.map.addControl(navigationControl, "top-left");

    const buttonControl = new ButtonControl([
      {
        title: "Draw Rectangle",
        class: "mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon",
        callback: () => {
          if (this.map.getZoom() < minimumSelectionZoomLevel) {
            alert(
              "The area that can be selected is too large at this zoom level. Please zoom closer."
            );
            return;
          }

          this.draw.changeMode("draw_rectangle");
        },
      },
      {
        title: "Trash",
        class: "mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash",
        callback: () => {
          this.clearLayers();
        },
      },
    ]);
    this.map.addControl(buttonControl, "top-left");

    const attributionControl = new AttributionControl({
      customAttribution:
        'More information at <a href="https://github.com/n-thumann/easybell-carrier-map" ' +
        'target="_blank">github.com/n-thumann/easybell-carrier-map</a>',
    });
    this.map.addControl(attributionControl, "bottom-left");
  }

  private getLayers() {
    return Object.entries(this.map.style._layers)
      .filter((layer) => layer[0].startsWith("hexagon-"))
      .map((item) => item[1]) as FillStyleLayer[];
  }

  public clearLayers() {
    for (const layer of this.getLayers()) this.map.removeLayer(layer.id);
  }

  public clearDrawing() {
    this.draw.deleteAll();
  }

  public registerDrawCallback(callback: (selection: Selection) => void) {
    this.map.on("draw.create", (event) => {
      const coordinates = event.features[0].geometry.coordinates[0];
      const longitudes = coordinates.map((coordinate: number[]) => coordinate[0]);
      const latitudes = coordinates.map((coordinate: number[]) => coordinate[1]);

      const selection = new Selection(
        Math.min(...latitudes),
        Math.min(...longitudes),
        Math.max(...latitudes),
        Math.max(...longitudes)
      );
      callback(selection);
    });
  }

  public addPendingHexagons(hexagons: Hexagon[]) {
    for (const hexagon of hexagons) this.displayPendingHexagon(hexagon);

    this.displayPulsating();
    this.draw.deleteAll();
  }

  public displayPendingHexagon(hexagon: Hexagon) {
    this.map.addSource(hexagon.id, {
      type: "geojson",
      data: hexagon.geometry,
    });

    const layer: FillLayerSpecification = {
      id: hexagon.id,
      type: "fill",
      source: hexagon.id,
      paint: {
        "fill-color": GRAY,
        "fill-outline-color": "#000000",
        "fill-opacity": 0.5,
      },
      metadata: {
        pending: true,
      },
    };

    this.map.addLayer(layer);
  }

  private displayPulsating() {
    if (this.pendingAnimationInterval) return;

    let toggle = true;
    this.pendingAnimationInterval = window.setInterval(() => {
      const pendingLayers = this.getLayers().filter(
        (layer) => (layer.metadata as LayerMetadata).pending === true
      );

      if (!pendingLayers.length) {
        window.clearInterval(this.pendingAnimationInterval);
        this.pendingAnimationInterval = 0;
        return;
      }

      pendingLayers.forEach((layer) => {
        this.map.setPaintProperty(layer.id, "fill-opacity", toggle ? 0.1 : 0.5);
      });
      toggle = !toggle;
    }, 1000);
  }

  public finishedLoadingHexagon(id: string, result: LocationResult | null) {
    const layer = this.map.getLayer(id);

    this.map.setPaintProperty(id, "fill-opacity", 0.4);
    this.map.setPaintProperty(id, "fill-color", result?.carrier.color || GRAY);

    (layer.metadata as LayerMetadata).pending = false;

    this.map.on("click", id, (ev) => {
      let html = "Overpass didn't find any addresses or Easybell has no VDSL coverage in this area";
      let longitude = ev.lngLat.lng;
      let latitude = ev.lngLat.lat;

      if (result) {
        html = `Found ${result.carrier.name} at ${result.location}`;
        longitude = result.location.geometry.coordinates[0];
        latitude = result.location.geometry.coordinates[1];
      }

      this.popup
        .setLngLat({
          lng: longitude,
          lat: latitude,
        })
        .setHTML(html)
        .addTo(this.map);
    });
  }
}

export { Map };
