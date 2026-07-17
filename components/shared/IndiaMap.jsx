// import React, { useState } from "react";
// import {
// ComposableMap,
// Geographies,
// Geography,
// Marker,
// } from "react-simple-maps";

// // ✅ Valid GeoJSON for India (FeatureCollection)
// const geoUrl =
// "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

// // ✅ 10 city markers
// const indiaPoints = [
// { name: "Delhi", coordinates: [77.1025, 28.7041] },
// { name: "Delhi-1", coordinates: [77.2025, 28.7041] },
// { name: "Mumbai", coordinates: [72.8777, 19.076] },
// { name: "Chennai", coordinates: [80.2707, 13.0827] },
// { name: "Kolkata", coordinates: [88.3639, 22.5726] },
// { name: "Bangalore", coordinates: [77.5946, 12.9716] },
// { name: "Hyderabad", coordinates: [78.4867, 17.385] },
// { name: "Ahmedabad", coordinates: [72.5714, 23.0225] },
// { name: "Pune", coordinates: [73.8567, 18.5204] },
// { name: "Jaipur", coordinates: [75.7873, 26.9124] },
// { name: "Lucknow", coordinates: [80.9462, 26.8467] },
// ];

// export default function IndiaMap() {
// const [hovered, setHovered] = useState(null);

// return (
// <div className="w-full max-w-5xl mx-auto p-4 bg-[#ccc] rounded">
// {/* <h2 className="text-xl font-semibold text-center mb-4 text-white">
// India Map with 10 City Markers
// </h2> */}
// <ComposableMap
// projection="geoMercator"
// projectionConfig={{ scale: 1200, center: [82.8, 22] }}
// width={600}
// height={600}
// style={{ width: "100%", height: "auto", backgroundColor: "#ccc" }}
// >
// {/* India Geographies */}
// <Geographies geography={geoUrl}>
// {({ geographies }) =>
// geographies.map((geo) => (
// <Geography
// key={geo.rsmKey}
// geography={geo}
// fill="#3b82f6" // dark grey India fill
// stroke="#fff" // blue border
// strokeWidth={0.4}
// />
// ))
// }
// </Geographies>
//     {/* Markers */}
//     {indiaPoints.map((point) => (
//       <Marker
//         key={point.name}
//         coordinates={point.coordinates}
//         onMouseEnter={() => setHovered(point.name)}
//         onMouseLeave={() => setHovered(null)}
//       >
//         <circle r={3} fill="limegreen" stroke="#000" strokeWidth={1} />
//         {hovered === point.name && (
//           <text
//             y={-10}
//             textAnchor="middle"
//             style={{
//               fontSize: 8,
//               fill: "#fff",
//               fontWeight: "bold",
//               pointerEvents: "none",
//             }}
//           >
//             {point.name}
//           </text>
//         )}
//       </Marker>
//     ))}
//   </ComposableMap>
// </div>
// );
// }

// import React, { useState } from "react";
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   Marker,
//   ZoomableGroup,
// } from "react-simple-maps";

// const geoUrl =
//   "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

// const indiaPoints = [
//   { name: "Delhi", coordinates: [77.1025, 28.7041] },
//   { name: "Delhi-1", coordinates: [77.2025, 28.7041] },
//   { name: "Mumbai", coordinates: [72.8777, 19.076] },
//   { name: "Chennai", coordinates: [80.2707, 13.0827] },
//   { name: "Kolkata", coordinates: [88.3639, 22.5726] },
//   { name: "Bangalore", coordinates: [77.5946, 12.9716] },
//   { name: "Hyderabad", coordinates: [78.4867, 17.385] },
//   { name: "Ahmedabad", coordinates: [72.5714, 23.0225] },
//   { name: "Pune", coordinates: [73.8567, 18.5204] },
//   { name: "Jaipur", coordinates: [75.7873, 26.9124] },
//   { name: "Lucknow", coordinates: [80.9462, 26.8467] },
// ];

// export default function IndiaMap() {
//   const [hovered, setHovered] = useState(null);

//   return (
//     <div className="w-[400px] h-[400px] mx-auto rounded bg-[#ccc] p-2">
//       <ComposableMap
//         projection="geoMercator"
//         width={400}
//         height={400}
//         style={{ width: "100%", height: "100%" }}
//       >
//         <ZoomableGroup
//           center={[82.8, 22]} // Center of India
//           zoom={2.8}          // Zoom level to fit India in 400x400
//           minZoom={1}
//           maxZoom={10}
//           translateExtent={[
//             [0, 0],
//             [1000, 1000],
//           ]}
//         >
//           <Geographies geography={geoUrl}>
//             {({ geographies }) =>
//               geographies.map((geo) => (
//                 <Geography
//                   key={geo.rsmKey}
//                   geography={geo}
//                   fill="#3b82f6"
//                   stroke="#fff"
//                   strokeWidth={0.4}
//                 />
//               ))
//             }
//           </Geographies>

//           {indiaPoints.map((point) => (
//             <Marker
//               key={point.name}
//               coordinates={point.coordinates}
//               onMouseEnter={() => setHovered(point.name)}
//               onMouseLeave={() => setHovered(null)}
//             >
//               <circle r={0.5} fill="red" stroke="#fff" strokeWidth={0.1} />
//               {hovered === point.name && (
//                 <text
//                   y={-10}
//                   textAnchor="middle"
//                   style={{
//                     fontSize: 8,
//                     fill: "#000",
//                     fontWeight: "bold",
//                     pointerEvents: "none",
//                   }}
//                 >
//                   {point.name}
//                 </text>
//               )}
//             </Marker>
//           ))}
//         </ZoomableGroup>
//       </ComposableMap>
//     </div>
//   );
// }
