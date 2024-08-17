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
    const userLocationRef = useRef(null);

    useEffect(() => {
        const initializeMap = async (center) => {
            if (mapRef.current) {
                const map = await createMap({
                    container: mapRef.current,
                    center,
                    zoom: 14,
                });

                mapInstance.current = map;

                // Add the user's location marker (red)
                new maplibregl.Marker({ color: 'red' })
                    .setLngLat(center)
                    .addTo(map);

                userLocationRef.current = center;

                let nearestBin = null;
                let minDistance = Infinity;

                bins.forEach(bin => {
                    const binLocation = [bin.x, bin.y];
                    const distance = Math.sqrt(
                        Math.pow(center[0] - binLocation[0], 2) +
                        Math.pow(center[1] - binLocation[1], 2)
                    );

                    const marker = new maplibregl.Marker()
                        .setLngLat(binLocation)
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
                    setSelectedBin(bins.find(bin => [bin.x, bin.y].toString() === nearestBin.toString()));
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

    const handleGetDirections = async () => {
        if (!selectedBin) {
            console.warn('No bin selected for routing.');
            return;
        }
    
        try {
            const session = await fetchAuthSession();
            const client = new LocationClient({
                credentials: session.credentials,
                region: 'us-east-1',
            });
    
            const params = {
                CalculatorName: 'MyRouteCalculator',
                DeparturePosition: userLocationRef.current,  // Start from the user's location
                DestinationPosition: [selectedBin.x, selectedBin.y],  // End at the selected bin
                TravelMode: 'Car'
            };
    
            console.log('Calculating route with params:', params);
            const command = new CalculateRouteCommand(params);
            const response = await client.send(command);
            console.log('Route Response:', response);
    
            if (response.Legs && response.Legs.length > 0) {
                let routeCoordinates;
    
                // Use Polyline if available
                if (response.Legs[0].Geometry && response.Legs[0].Geometry.LineString) {
                    routeCoordinates = response.Legs[0].Geometry.LineString;
                } else {
                    // Fallback to using Steps
                    routeCoordinates = response.Legs[0].Steps.flatMap(step => [
                        [step.StartPosition[0], step.StartPosition[1]],
                        [step.EndPosition[0], step.EndPosition[1]]
                    ]);
                }
    
                console.log('Route Coordinates:', routeCoordinates);
    
                if (routeCoordinates.length === 0) {
                    console.warn('No route steps found.');
                    return;
                }
    
                const routeGeoJSON = {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: routeCoordinates,
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
            } else {
                console.error('Invalid route response format:', response);
                alert('No route found or response format is unexpected.');
            }
        } catch (error) {
            console.error('Error getting directions:', error);
            alert('Failed to get directions. Please try again.');
        }
    };
    
    
    return (
        <div className="map-container">
            <div ref={mapRef} id="map" style={{ width: sidebarVisible ? '75%' : '100%', height: '100vh', float: 'left' }} />
            {sidebarVisible && selectedBin && (
                <div className="sidebar" style={{ width: '25%', height: '100vh', float: 'left', padding: '10px', boxSizing: 'border-box' }}>
                    <h2>{selectedBin.Name}</h2>
                    <button onClick={handleGetDirections}>Get Directions</button>
                    <button onClick={() => setSidebarVisible(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
