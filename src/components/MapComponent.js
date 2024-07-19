// components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-geocoder.css';
import * as turf from '@turf/turf';
import bins from './bins.json'; 
import ORS from 'openrouteservice-js';

const orsDirections = new ORS.Directions({
    api_key: '5b3ce3597851110001cf6248b2b878a244324b52acd0d40f0fac5de3' 
});

const MapComponent = () => {
    const mapRef = useRef(null);

    useEffect(() => {
        let map;

        const initializeMap = async (center) => {
            if (mapRef.current) {
                map = await createMap({
                    container: mapRef.current,
                    center,
                    zoom: 14, // Increased zoom level for a closer view
                });

                console.log('Map initialized at center:', center); // Debugging info

                // Add a marker for the user's location
                new maplibregl.Marker({ color: 'red' })
                    .setLngLat(center)
                    .addTo(map);

                // Add markers for the bins and calculate distances
                const userLocation = turf.point(center);
                let nearestBin = null;
                let minDistance = Infinity;

                bins.forEach(bin => {
                    const binLocation = turf.point([bin.x, bin.y]);
                    const distance = turf.distance(userLocation, binLocation);

                    new maplibregl.Marker()
                        .setLngLat([bin.x, bin.y])
                        .addTo(map);

                    if (distance < minDistance) {
                        nearestBin = [bin.x, bin.y];
                        minDistance = distance;
                    }
                });

                if (nearestBin) {
                    console.log('Nearest bin location:', nearestBin);

                    // Get route from user's location to the nearest bin
                    orsDirections.calculate({
                        coordinates: [center, nearestBin],
                        profile: 'driving-car',
                        format: 'geojson'
                    }).then(response => {
                        const route = response.routes[0].geometry;

                        map.addSource('route', {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: route
                            }
                        });

                        map.addLayer({
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
                    }).catch(error => {
                        console.error('Error getting directions:', error);
                    });
                }
            }
        };

        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log('User location:', { latitude, longitude }); // Debugging info
                        initializeMap([longitude, latitude]);
                    },
                    (error) => {
                        console.error('Error getting user location:', error); // Debugging info
                        // Default to Lebanon if user location cannot be determined
                        const lebanonCoords = [35.5, 33.9];
                        initializeMap(lebanonCoords);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.'); // Debugging info
                // Default to Lebanon if geolocation is not supported
                const lebanonCoords = [35.5, 33.9];
                initializeMap(lebanonCoords);
            }
        };

        getUserLocation();

        return () => {
            if (map) map.remove();
        };
    }, []);

    return <div ref={mapRef} id="map" style={{ width: '100%', height: '100vh' }} />;
};

export default MapComponent;
