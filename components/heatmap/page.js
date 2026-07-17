// 'use client';

// import { useEffect, useRef } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// export default function HeatmapPage() {
//   const mapRef = useRef(null);

//   useEffect(() => {
//     const loadScript = (src) =>
//       new Promise((resolve, reject) => {
//         if (document.querySelector(`script[src="${src}"]`)) return resolve();
//         const script = document.createElement('script');
//         script.src = src;
//         script.async = true;
//         script.onload = resolve;
//         script.onerror = reject;
//         document.head.appendChild(script);
//       });

//     const initHeatmap = async () => {
//       try {
//         if (typeof window === 'undefined') return;

//         // ✅ Use unpkg instead of jsDelivr (exposes window.HeatmapOverlay reliably)
//         await loadScript('https://unpkg.com/heatmap.js@2.0.5/build/heatmap.min.js');
//         await loadScript('https://unpkg.com/leaflet-heatmap/leaflet-heatmap.js');

//         if (!window.HeatmapOverlay) {
//           console.error("❌ HeatmapOverlay is not defined on window.");
//           return;
//         }

//         if (mapRef.current && mapRef.current._leaflet_id) return;

//         const map = L.map('map').setView([21.1466, 79.0888], 5);
//         mapRef.current = map;

//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: '&copy; OpenStreetMap contributors'
//         }).addTo(map);

//         const heatmapPoints = [
//           { lat: 28.6139, lng: 77.2090, value: 0.8 },
//           { lat: 19.0760, lng: 72.8777, value: 0.6 },
//           { lat: 13.0827, lng: 80.2707, value: 0.4 },
//           { lat: 22.5726, lng: 88.3639, value: 0.9 },
//           { lat: 12.9716, lng: 77.5946, value: 1.0 }
//         ];

//         const heatmapData = {
//           max: 1,
//           data: heatmapPoints
//         };

//         const heatLayer = new window.HeatmapOverlay({
//           radius: 0.05,
//           maxOpacity: 0.8,
//           scaleRadius: true,
//           useLocalExtrema: false,
//           latField: 'lat',
//           lngField: 'lng',
//           valueField: 'value'
//         });

//         heatLayer.setData(heatmapData);
//         heatLayer.addTo(map);
//       } catch (err) {
//         console.error("🔥 Heatmap init error:", err);
//       }
//     };

//     initHeatmap();
//   }, []);

//   return <div id="map" style={{ width: '100%', height: '100vh' }} />;
// }


//working heatmap
// 'use client';

// import { useEffect, useRef } from 'react';
// import Script from 'next/script';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// export default function HeatmapPage() {
//   const mapRef = useRef(null);

//   const indiaHeatData = {
//     max: 10,
//     data: [
//       { lat: 28.6139, lng: 77.2090, count: 10 }, // Delhi (High)
//       { lat: 19.0760, lng: 72.8777, count: 9 },  // Mumbai (High)
//       { lat: 17.3850, lng: 78.4867, count: 6 },  // Hyderabad (Medium)
//       { lat: 13.0827, lng: 80.2707, count: 5 },  // Chennai (Medium)
//       { lat: 22.5726, lng: 88.3639, count: 4 },  // Kolkata (Medium)
//       { lat: 15.2993, lng: 74.1240, count: 3 },  // Goa (Low)
//       { lat: 21.1702, lng: 72.8311, count: 2 },  // Surat (Low)
//       { lat: 26.9124, lng: 75.7873, count: 5 },  // Jaipur (Medium)
//       { lat: 23.0225, lng: 72.5714, count: 1 },  // Ahmedabad (Low)
//       { lat: 12.9716, lng: 77.5946, count: 8 }   // Bengaluru (High)
//     ]
//   };

//   useEffect(() => {
//     const waitForHeatmapScript = () => {
//       const check = setInterval(() => {
//         if (typeof window !== 'undefined' && window.HeatmapOverlay && !mapRef.current) {
//           clearInterval(check);
//           initMap();
//         }
//       }, 200);
//     };

//     waitForHeatmapScript();
//   }, []);

//   const initMap = () => {
//     const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: 'Map data © OpenStreetMap contributors',
//       maxZoom: 18
//     });

//     const cfg = {
//       radius: 30,
//       maxOpacity: 0.8,
//       scaleRadius: true,
//       useLocalExtrema: false,
//       latField: 'lat',
//       lngField: 'lng',
//       valueField: 'count',
//       gradient: {
//         0.1: 'green',
//         0.5: 'yellow',
//         0.9: 'red'
//       }
//     };

//     const heatmapLayer = new window.HeatmapOverlay(cfg);

//     const map = new L.Map('map', {
//       center: new L.LatLng(22.9734, 78.6569), // India center
//       zoom: 5,
//       layers: [baseLayer, heatmapLayer]
//     });

//     mapRef.current = map;

//     heatmapLayer.setData(indiaHeatData);
//   };

//   return (
//     <>
//       {/* External scripts for heatmap.js and leaflet-heatmap.js */}
//       <Script src="https://unpkg.com/heatmap.js@2.0.5/build/heatmap.min.js" strategy="afterInteractive" />
//       <Script src="https://unpkg.com/leaflet-heatmap/leaflet-heatmap.js" strategy="afterInteractive" />
//       <div id="map" style={{ height: '100vh', width: '100%' }} />
//     </>
//   );
// }

//end


'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiRoutes from '@/common/constants/apiRoutes';
import { apiRequest } from '@/common/api/apiService';
import { useRouter } from 'next/navigation';

export default function HeatmapPage() {
    const mapRef = useRef(null);
    const hasFetchedUsers = useRef(false);
    const [heatmapData, setHeatmapData] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (!hasFetchedUsers.current) {
            hasFetchedUsers.current = true;
            fetchUsers();
        }
    }, []);

    const fetchUsers = async () => {
        const payload = {
            params: {
                pagination: 'false',
            },
        };
        try {
            const data = await apiRequest(apiRoutes.userList, 'POST', payload, router);
            if (data?.response) {
                const userList = data?.data?.docs || [];
                const heatData = {
                    max: 5,
                    data: generateHeatmapData(userList)
                };
                console.log('Heatmap Data:', heatData);
                setHeatmapData(heatData);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    function generateHeatmapData(users) {
        const locationMap = {};

        users.forEach(user => {
            const lat = user?.latitude;
            const lng = user?.longitude;

            if (lat == null || lng == null) return;

            const key = `${lat},${lng}`;
            if (!locationMap[key]) {
                locationMap[key] = { lat, lng, count: 1 };
            } else {
                locationMap[key].count += 1;
            }
        });

        return Object.values(locationMap);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (
                typeof window !== 'undefined' &&
                window.HeatmapOverlay &&
                heatmapData &&
                !mapRef.current
            ) {
                clearInterval(interval);
                initMap(heatmapData);
            }
        }, 200);
    }, [heatmapData]);

    const initMap = (data) => {
        const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © OpenStreetMap contributors',
            maxZoom: 18
        });

        const cfg = {
            radius: 10,
            maxOpacity: 0.5,
            scaleRadius: false,
            useLocalExtrema: false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count',
            gradient: {
                0.1: 'green',
                0.5: 'yellow',
                0.9: 'red'
            }
        };

        const heatmapLayer = new window.HeatmapOverlay(cfg);

        const map = new L.Map('map', {
            center: new L.LatLng(22.9734, 78.6569), // Center of India
            zoom: 5,
            minZoom: 4,
            maxBounds: [
                [5.5, 67.0],   // Southwest India
                [37.5, 98.0]   // Northeast India
            ],
            layers: [baseLayer, heatmapLayer]
        });

        heatmapLayer.setData(data);
        mapRef.current = map;
    };

    return (
        <>
            <Script src="https://unpkg.com/heatmap.js@2.0.5/build/heatmap.min.js" strategy="afterInteractive" />
            <Script src="https://unpkg.com/leaflet-heatmap/leaflet-heatmap.js" strategy="afterInteractive" />
            <div id="map" style={{ height: '100vh', width: '100%' }} />
        </>
    );
}



// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Script from 'next/script';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import apiRoutes from '@/common/constants/apiRoutes';
// import { apiRequest } from '@/common/api/apiService';
// import { useRouter } from 'next/navigation';

// export default function HeatmapPage() {
//     const mapRef = useRef(null);
//     const hasFetchedUsers = useRef(false);
//     const [users, setUsers] = useState([])
//     const router = useRouter();

//     const indiaHeatData = {
//         max: 10,
//         data: [
//             { lat: 28.6139, lng: 77.2090, count: 100 }, // Delhi (High)
//             { lat: 19.0760, lng: 72.8777, count: 9 },  // Mumbai
//             { lat: 17.3850, lng: 78.4867, count: 6 },  // Hyderabad
//             { lat: 13.0827, lng: 80.2707, count: 5 },  // Chennai
//             { lat: 22.5726, lng: 88.3639, count: 4 },  // Kolkata
//             { lat: 15.2993, lng: 74.1240, count: 3 },  // Goa
//             { lat: 21.1702, lng: 72.8311, count: 2 },  // Surat
//             { lat: 26.9124, lng: 75.7873, count: 5 },  // Jaipur
//             { lat: 23.0225, lng: 72.5714, count: 1 },  // Ahmedabad
//             { lat: 12.9716, lng: 77.5946, count: 8 }   // Bengaluru
//         ]
//     };

//     useEffect(() => {
//         if (!hasFetchedUsers.current) {
//             hasFetchedUsers.current = true;
//             fetchUsers();
//         }
//     }, []);
//     const fetchUsers = async () => {
//         // setIsLoading(true);
//         const payload = {
//             params: {
//                 pagination: 'false',
//             },
//         };
//         try {
//             const data = await apiRequest(apiRoutes.userList, 'POST', payload, router);
//             if (data?.response) {
//                 const userList = data?.data?.docs;
//                 const users = generateHeatmapData(userList)
//                 const indiaHeatData = {
//                     max: 10,
//                     data: users
//                 }
//                 console.log('indiaHeatData-api', indiaHeatData)
//                 setUsers(indiaHeatData)
//                 if (indiaHeatData) {
//                     initMap();
//                 }
//             }
//         } catch (error) {
//             console.error('Failed to fetch users:', error);
//         }
//         // finally {
//         //     setIsLoading(false);
//         // }
//     };

//     // const indiaHeatData = {
//     //     max: 10,
//     //     data: users
//     // }


//     function generateHeatmapData(users) {
//         const locationMap = {};

//         users.forEach(user => {
//             const key = `${user?.latitude},${user?.longitude}`;
//             if (!locationMap[key]) {
//                 locationMap[key] = { lat: user?.latitude, lng: user?.longitude, count: 1 };
//             } else {
//                 locationMap[key].count += 1;
//             }
//         });
//         // console.log('result-heat', Object.values(locationMap))
//         return Object.values(locationMap);
//     }



//     useEffect(() => {
//         const waitForHeatmapScript = () => {
//             const check = setInterval(() => {
//                 if (typeof window !== 'undefined' && window.HeatmapOverlay && !mapRef.current && users.length > 0) {
//                     clearInterval(check);
//                     initMap();
//                 }
//             }, 200);
//         };

//         waitForHeatmapScript();
//     }, []);

//     const initMap = () => {
//         const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: 'Map data © OpenStreetMap contributors',
//             maxZoom: 18
//         });

//         const cfg = {
//             radius: 10,
//             maxOpacity: 0.5,
//             scaleRadius: false,
//             useLocalExtrema: false,
//             latField: 'lat',
//             lngField: 'lng',
//             valueField: 'count',
//             gradient: {
//                 0.1: 'green',
//                 0.5: 'yellow',
//                 0.9: 'red'
//             }
//         };

//         const heatmapLayer = new window.HeatmapOverlay(cfg);

//         const map = new L.Map('map', {
//             center: new L.LatLng(22.9734, 78.6569),
//             zoom: 5,
//             minZoom: 4,
//             maxBounds: [
//                 [5.5, 67.0],   // Southwest India
//                 [37.5, 98.0]   // Northeast India
//             ],
//             layers: [baseLayer, heatmapLayer]
//         });

//         mapRef.current = map;

//         // heatmapLayer.setData(indiaHeatData);
//         console.log('indiaHeatData', indiaHeatData)
//         console.log('users', users)
//         // heatmapLayer.setData(users);
//     };

//     return (
//         <>
//             <Script src="https://unpkg.com/heatmap.js@2.0.5/build/heatmap.min.js" strategy="afterInteractive" />
//             <Script src="https://unpkg.com/leaflet-heatmap/leaflet-heatmap.js" strategy="afterInteractive" />
//             <div id="map" style={{ height: '100vh', width: '100%' }} />
//         </>
//     );
// }
