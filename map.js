// Set your Mapbox access token here
mapboxgl.accessToken =
  "pk.eyJ1IjoiZGtsb3BzdGVpbiIsImEiOiJjbTdjYjhkbmUwMm1qMmtwdHdremdlNGI3In0.BvfcTNPx43GcjN2dlGZHpg";

// Initialize the map
const map = new mapboxgl.Map({
  container: "map", // ID of the div where the map will render
  style: "mapbox://styles/mapbox/streets-v12", // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});

map.on("load", () => {
  map.addSource("boston_route", {
    type: "geojson",
    data: "https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...",
  });

  map.addLayer({
    id: "bike-lanes",
    type: "line",
    source: "boston_route",
    paint: {
      "line-color": "#32D400",
      "line-width": 4,
      "line-opacity": 0.4,
    },
  });
});
