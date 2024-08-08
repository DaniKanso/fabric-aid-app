// components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-geocoder.css';
import * as turf from '@turf/turf';
import bins from './bins.json'; 
import ORS from 'openrouteservice-js';
import './MapComponent.css'; // Add CSS for sidebar styling

const orsDirections = new ORS.Directions({
    api_key: '5b3ce3597851110001cf6248b2b878a244324b52acd0d40f0fac5de3'
});

const MapComponent = () => {
    const mapRef = useRef(null);
    const [selectedBin, setSelectedBin] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const mapInstance = useRef(null); // Use a ref to hold the map instance

    useEffect(() => {
        const initializeMap = async (center) => {
            if (mapRef.current) {
                const map = await createMap({
                    container: mapRef.current,
                    center,
                    zoom: 14,
                });

                mapInstance.current = map; // Store the map instance

                console.log('Map initialized at center:', center);

                new maplibregl.Marker({ color: 'red' })
                    .setLngLat(center)
                    .addTo(map);

                const userLocation = turf.point(center);
                let nearestBin = null;
                let minDistance = Infinity;

                bins.forEach(bin => {
                    const binLocation = turf.point([bin.x, bin.y]);
                    const distance = turf.distance(userLocation, binLocation);

                    const marker = new maplibregl.Marker()
                        .setLngLat([bin.x, bin.y])
                        .addTo(map);

                    marker.getElement().addEventListener('click', () => {
                        setSelectedBin(bin);
                        setSidebarVisible(true);
                    });

                    if (distance < minDistance) {
                        nearestBin = [bin.x, bin.y];
                        minDistance = distance;
                    }
                });

                if (nearestBin) {
                    console.log('Nearest bin location:', nearestBin);

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

    return (
        <div className="map-container">
            <div ref={mapRef} id="map" style={{ width: sidebarVisible ? '75%' : '100%', height: '100vh', float: 'left' }} />
            {sidebarVisible && (
                <div className="sidebar" style={{ width: '25%', height: '100vh', float: 'left', padding: '10px', boxSizing: 'border-box' }}>
                    {selectedBin ? (
                        <div>
                            <h2>{selectedBin.Name}</h2>
                            <button onClick={() => {
                                orsDirections.calculate({
                                    coordinates: [[selectedBin.x, selectedBin.y]],
                                    profile: 'driving-car',
                                    format: 'geojson'
                                }).then(response => {
                                    const route = response.routes[0].geometry;

                                    if (mapInstance.current.getSource('route')) {
                                        mapInstance.current.getSource('route').setData({
                                            type: 'Feature',
                                            properties: {},
                                            geometry: route
                                        });
                                    } else {
                                        mapInstance.current.addSource('route', {
                                            type: 'geojson',
                                            data: {
                                                type: 'Feature',
                                                properties: {},
                                                geometry: route
                                            }
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
                                }).catch(error => {
                                    console.error('Error getting directions:', error);
                                });
                            }}>Get Directions</button>
                            <button onClick={() => setSidebarVisible(false)}>Cancel</button>
                        </div>
                    ) : (
                        <div>Select a bin to see details</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MapComponent;
