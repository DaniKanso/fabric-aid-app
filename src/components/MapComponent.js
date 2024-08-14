import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-geocoder.css';
import bins from './bins.json';
import { LocationClient, CalculateRouteCommand } from '@aws-sdk/client-location';
import './MapComponent.css';
import { fetchAuthSession } from '@aws-amplify/auth';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [selectedBin, setSelectedBin] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const mapInstance = useRef(null);

    useEffect(() => {
        const initializeMap = async (center) => {
            if (mapRef.current) {
                const map = await createMap({
                    container: mapRef.current,
                    center,
                    zoom: 14,
                });

                mapInstance.current = map;

                new maplibregl.Marker({ color: 'red' })
                    .setLngLat(center)
                    .addTo(map);

                const userLocation = [center[0], center[1]];

                let nearestBin = null;
                let minDistance = Infinity;

                bins.forEach(bin => {
                    const binLocation = [bin.x, bin.y];
                    const distance = Math.sqrt(
                        Math.pow(userLocation[0] - binLocation[0], 2) +
                        Math.pow(userLocation[1] - binLocation[1], 2)
                    );

                    const marker = new maplibregl.Marker()
                        .setLngLat([bin.x, bin.y])
                        .addTo(map);

                    marker.getElement().addEventListener('click', () => {
                        setSelectedBin(bin);
                        setSidebarVisible(true);
                    });

                    if (distance < minDistance) {
                        nearestBin = binLocation;
                        minDistance = distance;
                    }
                });

                if (nearestBin) {
                    try {
                        // Obtain AWS credentials using Amplify Auth
                        const session = await fetchAuthSession();
                        const client = new LocationClient({
                            credentials: session.credentials,
                            region: 'us-east-1',
                        });

                        const params = {
                            CalculatorName: 'MyRouteCalculator', 
                            DeparturePosition: center,
                            DestinationPosition: nearestBin,
                            TravelMode: 'Car' // Adjust travel mode if needed
                        };

                        const command = new CalculateRouteCommand(params);
                        const response = await client.send(command);

                        const route = response.Legs[0].Geometry.LineString;

                        const routeGeoJSON = {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: route.map(([long, lat]) => [long, lat]),
                            }
                        };

                        map.addSource('route', {
                            type: 'geojson',
                            data: routeGeoJSON
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
                    } catch (error) {
                        console.error('Error getting directions:', error);
                    }
                }
            }
        };

        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
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
            {sidebarVisible && selectedBin && (
                <div className="sidebar" style={{ width: '25%', height: '100vh', float: 'left', padding: '10px', boxSizing: 'border-box' }}>
                    <h2>{selectedBin.Name}</h2>
                    <button onClick={async () => {
                        try {
                            const session = await fetchAuthSession();
                            console.log(session);
                            const client = new LocationClient({
                                credentials: session.credentials,
                                region: 'us-east-1',
                            });

                            const params = {
                                CalculatorName: 'MyRouteCalculator',
                                DeparturePosition: [mapInstance.current.getCenter().lng, mapInstance.current.getCenter().lat],
                                DestinationPosition: [selectedBin.x, selectedBin.y],
                                TravelMode: 'Car' // Adjust travel mode if needed
                            };

                            const command = new CalculateRouteCommand(params);
                            const response = await client.send(command);

                            const route = response.Legs[0].Geometry.LineString;

                            const routeGeoJSON = {
                                type: 'Feature',
                                geometry: {
                                    type: 'LineString',
                                    coordinates: route.map(([long, lat]) => [long, lat]),
                                }
                            };

                            if (mapInstance.current.getSource('route')) {
                                mapInstance.current.getSource('route').setData(routeGeoJSON);
                            } else {
                                mapInstance.current.addSource('route', {
                                    type: 'geojson',
                                    data: routeGeoJSON
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
                        } catch (error) {
                            console.error('Error getting directions:', error);
                        }
                    }}>Get Directions</button>
                    <button onClick={() => setSidebarVisible(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
