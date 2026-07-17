'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_OPTIONS } from '@/lib/googleMapsLoader'; // Adjust import as needed
const containerStyle = {
    width: '100%',
    height: '400px',
};
const GoogleMapPicker = ({
    initialLat,
    initialLng,
    onLocationSelect,
    label = "",
    required = false,
    formSubmitted = false,
    initalAddress = "",
}) => {
    const [selectedPosition, setSelectedPosition] = useState({ lat: initialLat, lng: initialLng });
    const [address, setAddress] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [touched, setTouched] = useState(false);

    const autocompleteRef = useRef(null);

    const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_API_OPTIONS);
    useEffect(() => {
        if (!address) {
            setTouched(false);
        }
    }, [address]);
    useEffect(() => {
        if (initalAddress && initalAddress !== '' && initialLat && initialLat !== '' &&
            initialLng && initialLng !== ''
        ) {
            setAddress(initalAddress);
            setSelectedPosition({ lat: Number(initialLat), lng: Number(initialLng) });
            setShowMap(true)
        }
    }, [initalAddress, initialLat, initialLng]);

    const hasError = required && address === '' && (touched || formSubmitted);

    const handleMapClick = useCallback((e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedPosition({ lat, lng });
        fetchAddress(lat, lng);
        onLocationSelect(lat, lng, address);
    }, [address, onLocationSelect]);

    const fetchAddress = (lat, lng) => {
        const geocoder = new window.google.maps.Geocoder();
        const latLng = new window.google.maps.LatLng(lat, lng);
        geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const resultAddress = results[0].formatted_address;
                setAddress(resultAddress);
                onLocationSelect(lat, lng, resultAddress);
            }
        });
    };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSelectedPosition({ lat, lng });
        setAddress(place.formatted_address || '');
        onLocationSelect(lat, lng, place.formatted_address);
        // Do not close the map automatically
    };

    if (!isLoaded) return <p>Loading Map...</p>;
    const isValidLatLng = selectedPosition.lat && selectedPosition.lng && !isNaN(selectedPosition.lat) && !isNaN(selectedPosition.lng);

    return (
        <div>
            {label !== '' && (
                <label
                    className='common-cursor'
                    htmlFor={label}
                    style={{
                        fontWeight: 500,
                        fontSize: '13px',
                        marginBottom: '4px',
                    }}
                >
                    {label}
                    {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}

            <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                onPlaceChanged={handlePlaceChanged}
                style={{
                    border: '2px solid #dbdbdb', borderRadius: '5px',
                    border: hasError ? '1px solid red' : '2px solid #DBDBDB',
                }}
            >
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => setShowMap(true)}
                    onBlur={() => setTouched(true)}
                    placeholder="Search location"
                    style={{
                        width: '100%',
                        height: '40px',
                        padding: '8px',
                        fontSize: '16px',
                        border: hasError ? '1px solid red' : '2px solid #DBDBDB',
                        borderRadius: '5px',
                    }}
                />
            </Autocomplete>
            {required && (
                <div style={{ height: '16px' }}>
                    {hasError && (
                        <span style={{ color: 'red', fontSize: '12px' }}>
                            {label.split('(')?.[0] || ""} required
                        </span>
                    )}
                </div>
            )}

            {showMap && isValidLatLng && (
                <>
                    <div style={{ margin: '10px 0' }}>
                        <button className='cursor' onClick={() => setShowMap(false)} style={{ padding: '8px 12px' }}>
                            Close Map
                        </button>
                    </div>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={selectedPosition}
                        zoom={15}
                    // onClick={handleMapClick}
                    >
                        <Marker position={selectedPosition} />
                    </GoogleMap>
                </>
            )}


        </div>
    );
};

export default GoogleMapPicker;
