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

// Initialize svg and stations array
const svg = d3.select("#map").select("svg");
let stations = [];
let trips = [];

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

  // CSV with bike traffic data URL
  const csvurl =
    "https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv";

  // JSON file with bike stations URL
  const jsonurl = "https://dsc106.com/labs/lab07/data/bluebikes-stations.json";
  d3.json(jsonurl)
    .then((jsonData) => {
      // Update the top-level stations array
      stations = jsonData.data.stations;

      // Load CSV data (trips)
      return d3.csv(csvurl);
    })
    .then((csvData) => {
      // Transform the CSV data into the desired structure
      trips = csvData.map((row) => {
        return {
          ride_id: row.ride_id,
          bike_type: row.bike_type,
          started_at: new Date(row.started_at).toISOString(),
          ended_at: new Date(row.ended_at).toISOString(),
          start_station_id: row.start_station_id,
          end_station_id: row.end_station_id,
          is_member: +row.is_member,
        };
      });

      // Calculate departures and arrivals
      const departures = d3.rollup(
        trips,
        (v) => v.length,
        (d) => d.start_station_id
      );

      const arrivals = d3.rollup(
        trips,
        (v) => v.length,
        (d) => d.end_station_id
      );

      // Update stations with arrivals, departures, and totalTraffic
      stations = stations.map((station) => {
        const id = station.short_name;
        station.arrivals = arrivals.get(id) ?? 0;
        station.departures = departures.get(id) ?? 0;
        station.totalTraffic = station.arrivals + station.departures;
        return station;
      });

      // Append circles to the SVG for each station
      const circles = svg
        .selectAll("circle")
        .data(stations)
        .enter()
        .append("circle")
        .attr("r", 5) // Radius of the circle
        .attr("fill", "steelblue") // Circle fill color
        .attr("stroke", "white") // Circle border color
        .attr("stroke-width", 1) // Circle border thickness
        .attr("opacity", 0.8); // Circle opacity

      // Define a D3 scale for circle radii
      const radiusScale = d3
        .scaleSqrt()
        .domain([0, d3.max(stations, (d) => d.totalTraffic)])
        .range([0, 25]);

      // Update the circle radius attribute to use the scale
      circles.attr("r", (d) => radiusScale(d.totalTraffic)); // Set radius based on totalTraffic

      // Define function to convert longitute and latitude to pixel values
      function getCoords(station) {
        const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Convert lon/lat to Mapbox LngLat
        const { x, y } = map.project(point); // Project to pixel coordinates
        return { cx: x, cy: y }; // Return as object for use in SVG attributes
      }

      // Function to update circle positions when the map moves/zooms
      function updatePositions() {
        circles
          .attr("cx", (d) => getCoords(d).cx) // Set the x-position using projected coordinates
          .attr("cy", (d) => getCoords(d).cy); // Set the y-position using projected coordinates
      }

      // Initial position update when map loads
      updatePositions();
      // Reposition markers on map interactions
      map.on("move", updatePositions); // Update during map movement
      map.on("zoom", updatePositions); // Update during zooming
      map.on("resize", updatePositions); // Update on window resize
      map.on("moveend", updatePositions); // Final adjustment after movement ends
    })
    .catch((error) => {
      console.error("Error loading JSON:", error); // Handle errors if JSON loading fails
    });
});
