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
  // Boston bike routes
  map.addSource("boston_routes", {
    type: "geojson",
    data: "https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson?...",
  });

  map.addLayer({
    id: "boston-bike-lanes",
    type: "line",
    source: "boston_routes",
    paint: {
      "line-color": "#32D400",
      "line-width": 4,
      "line-opacity": 0.4,
    },
  });

  //   Cambridge bike routes
  map.addSource("cambridge_routes", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson",
  });

  map.addLayer({
    id: "cambridge-bike-lanes",
    type: "line",
    source: "cambridge_routes",
    paint: {
      "line-color": "#32D400",
      "line-width": 4,
      "line-opacity": 0.4,
    },
  });
});
