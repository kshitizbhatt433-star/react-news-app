import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Simplified India GeoJSON (states) - More accurate shapes
const indiaGeoJson = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Jammu and Kashmir", state: "JK" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.0, 32.0], [78.0, 32.0], [78.0, 37.0], [74.0, 37.0], [74.0, 32.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Himachal Pradesh", state: "HP" },
      geometry: {
        type: "Polygon",
        coordinates: [[[75.5, 30.0], [79.0, 30.0], [79.0, 33.5], [75.5, 33.5], [75.5, 30.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Punjab", state: "PB" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.0, 29.5], [76.5, 29.5], [76.5, 32.5], [74.0, 32.5], [74.0, 29.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Haryana", state: "HR" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.5, 27.5], [77.5, 27.5], [77.5, 30.5], [74.5, 30.5], [74.5, 27.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Delhi", state: "DL" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.0, 28.4], [77.4, 28.4], [77.4, 28.8], [77.0, 28.8], [77.0, 28.4]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Uttarakhand", state: "UT" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.5, 28.5], [81.0, 28.5], [81.0, 31.0], [77.5, 31.0], [77.5, 28.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Uttar Pradesh", state: "UP" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.0, 23.5], [84.0, 23.5], [84.0, 30.5], [77.0, 30.5], [77.0, 23.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Bihar", state: "BR" },
      geometry: {
        type: "Polygon",
        coordinates: [[[83.0, 24.0], [88.0, 24.0], [88.0, 27.5], [83.0, 27.5], [83.0, 24.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Jharkhand", state: "JH" },
      geometry: {
        type: "Polygon",
        coordinates: [[[83.0, 21.5], [87.5, 21.5], [87.5, 25.0], [83.0, 25.0], [83.0, 21.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "West Bengal", state: "WB" },
      geometry: {
        type: "Polygon",
        coordinates: [[[85.5, 21.5], [89.0, 21.5], [89.0, 27.0], [85.5, 27.0], [85.5, 21.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Sikkim", state: "SK" },
      geometry: {
        type: "Polygon",
        coordinates: [[[88.0, 27.0], [89.0, 27.0], [89.0, 28.0], [88.0, 28.0], [88.0, 27.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Assam", state: "AS" },
      geometry: {
        type: "Polygon",
        coordinates: [[[89.0, 24.0], [96.0, 24.0], [96.0, 28.0], [89.0, 28.0], [89.0, 24.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Arunachal Pradesh", state: "AR" },
      geometry: {
        type: "Polygon",
        coordinates: [[[91.0, 26.0], [97.0, 26.0], [97.0, 29.0], [91.0, 29.0], [91.0, 26.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Nagaland", state: "NL" },
      geometry: {
        type: "Polygon",
        coordinates: [[[93.0, 25.0], [95.0, 25.0], [95.0, 27.0], [93.0, 27.0], [93.0, 25.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Manipur", state: "MN" },
      geometry: {
        type: "Polygon",
        coordinates: [[[93.0, 23.5], [95.0, 23.5], [95.0, 25.5], [93.0, 25.5], [93.0, 23.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Mizoram", state: "MZ" },
      geometry: {
        type: "Polygon",
        coordinates: [[[92.0, 21.5], [93.5, 21.5], [93.5, 24.0], [92.0, 24.0], [92.0, 21.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Tripura", state: "TR" },
      geometry: {
        type: "Polygon",
        coordinates: [[[91.0, 23.0], [92.5, 23.0], [92.5, 24.5], [91.0, 24.5], [91.0, 23.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Meghalaya", state: "ML" },
      geometry: {
        type: "Polygon",
        coordinates: [[[90.0, 25.0], [92.0, 25.0], [92.0, 26.5], [90.0, 26.5], [90.0, 25.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Rajasthan", state: "RJ" },
      geometry: {
        type: "Polygon",
        coordinates: [[[69.0, 23.5], [78.0, 23.5], [78.0, 30.0], [69.0, 30.0], [69.0, 23.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Gujarat", state: "GJ" },
      geometry: {
        type: "Polygon",
        coordinates: [[[68.0, 20.0], [74.5, 20.0], [74.5, 24.5], [68.0, 24.5], [68.0, 20.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Madhya Pradesh", state: "MP" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.0, 21.0], [82.0, 21.0], [82.0, 26.5], [74.0, 26.5], [74.0, 21.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Chhattisgarh", state: "CT" },
      geometry: {
        type: "Polygon",
        coordinates: [[[80.5, 17.0], [84.0, 17.0], [84.0, 23.5], [80.5, 23.5], [80.5, 17.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Maharashtra", state: "MH" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.5, 15.5], [80.5, 15.5], [80.5, 22.0], [72.5, 22.0], [72.5, 15.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Goa", state: "GA" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.5, 14.5], [74.5, 14.5], [74.5, 15.5], [73.5, 15.5], [73.5, 14.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Karnataka", state: "KA" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.0, 11.5], [78.0, 11.5], [78.0, 18.5], [74.0, 18.5], [74.0, 11.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Telangana", state: "TG" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.0, 15.5], [81.0, 15.5], [81.0, 19.5], [77.0, 19.5], [77.0, 15.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Andhra Pradesh", state: "AP" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.5, 13.5], [84.0, 13.5], [84.0, 19.0], [76.5, 19.0], [76.5, 13.5]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Tamil Nadu", state: "TN" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.5, 8.0], [80.5, 8.0], [80.5, 13.5], [76.5, 13.5], [76.5, 8.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kerala", state: "KL" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.5, 8.0], [77.5, 8.0], [77.5, 12.5], [74.5, 12.5], [74.5, 8.0]]]
      }
    },
    {
      type: "Feature",
      properties: { name: "Puducherry", state: "PY" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.5, 10.5], [80.0, 10.5], [80.0, 11.5], [79.5, 11.5], [79.5, 10.5]]]
      }
    }
  ]
};

const IndiaMap = ({ onStateClick, selectedState }) => {
  const [hoveredState, setHoveredState] = useState(null);

  try {
    return (
      <div className="india-map-container">
        <h3 className="map-title">🗺️ India News Map</h3>
        <p className="map-subtitle">Click on a state to filter the latest headlines</p>

        <div className="map-wrapper">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
              center: [78.9629, 22.5937] // Center of India
            }}
            width={600}
            height={600}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={indiaGeoJson}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name;
                  const isSelected = selectedState === stateName;
                  const isHovered = hoveredState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        isSelected
                          ? "#ff4444"
                          : isHovered
                          ? "#ff6666"
                          : "#2a2a2a"
                      }
                      stroke="#666"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "#ff6666" },
                        pressed: { outline: "none" }
                      }}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => onStateClick && onStateClick(stateName)}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>

        {selectedState && (
          <div className="selected-state-info">
            <p>Showing news for: <strong>{selectedState}</strong></p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Map rendering error:", error);
    return (
      <div className="india-map-container">
        <h3 className="map-title">🗺️ India News Map</h3>
        <p className="map-subtitle">Interactive news map temporarily unavailable</p>
        <div className="map-wrapper" style={{ justifyContent: 'center', alignItems: 'center', color: 'var(--muted)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <p>Map visualization loading...</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Click state names to filter the latest headlines.</p>
          </div>
        </div>
      </div>
    );
  }
};

export default IndiaMap;