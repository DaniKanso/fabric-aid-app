// components/ShopMapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-geocoder.css';
import * as turf from '@turf/turf';
import shops from './shops.json'; 
import './MapComponent.css'; // Reuse the same CSS file

const ShopMapComponent = () => {
    const mapRef = useRef(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const mapInstance = useRef(null);
    const userLocation = useRef(null);

    useEffect(() => {
        const initializeMap = async (center) => {
            if (mapRef.current) {
                const map = await createMap({
                    container: mapRef.current,
                    center,
                    zoom: 14,
                });

                mapInstance.current = map;
                userLocation.current = center;

                console.log('Map initialized at center:', center);

                new maplibregl.Marker({ color: 'red' })
                    .setLngLat(center)
                    .addTo(map);

                shops.forEach(shop => {
                    const marker = new maplibregl.Marker()
                        .setLngLat([shop.x, shop.y])
                        .addTo(map);

                    marker.getElement().addEventListener('click', () => {
                        setSelectedShop(shop);
                        setSidebarVisible(true);
                    });
                });
            }
        };

        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log('User location:', { latitude, longitude });
                        initializeMap([longitude, latitude]);
                    },
                    (error) => {
                        console.error('Error getting user location:', error);
                        const lebanonCoords = [35.5, 33.9];
                        initializeMap(lebanonCoords);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
                const lebanonCoords = [35.5, 33.9];
                initializeMap(lebanonCoords);
            }
        };

        getUserLocation();

        return () => {
            if (mapInstance.current) mapInstance.current.remove();
        };
    }, []);

    const calculateAndDrawRoute = () => {
        if (!userLocation.current || !selectedShop) return;

        const start = turf.point(userLocation.current);
        const end = turf.point([selectedShop.x, selectedShop.y]);
        const line = turf.lineString([userLocation.current, [selectedShop.x, selectedShop.y]]);

        if (mapInstance.current.getSource('route')) {
            mapInstance.current.getSource('route').setData(line);
        } else {
            mapInstance.current.addSource('route', {
                type: 'geojson',
                data: line
            });

            mapInstance.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
        }
    };

    return (
        <div className="map-container">
            <div ref={mapRef} id="map" style={{ width: sidebarVisible ? '75%' : '100%', height: '100vh', float: 'left' }} />
            {sidebarVisible && (
                <div className="sidebar" style={{ width: '25%', height: '100vh', float: 'left', padding: '10px', boxSizing: 'border-box' }}>
                    {selectedShop ? (
                        <div>
                            <h2>{selectedShop.Name}</h2>
                            <button onClick={calculateAndDrawRoute}>
                                Get Directions
                            </button>
                            <button onClick={() => setSidebarVisible(false)}>Cancel</button>
                        </div>
                    ) : (
                        <div>Select a shop to see details</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopMapComponent;
