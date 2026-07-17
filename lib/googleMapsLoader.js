// lib/googleMapsLoader.js
export const GOOGLE_MAPS_LIBRARIES = ['places']; 

export const GOOGLE_MAPS_API_OPTIONS = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  libraries: GOOGLE_MAPS_LIBRARIES,
};
