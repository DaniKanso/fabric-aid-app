import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { createMap } from 'maplibre-gl-js-amplify';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import 'maplibre-gl-js-amplify/dist/public/amplify-geocoder.css';
import * as turf from '@turf/turf';
import bins from './bins.json'; 
import ORS from 'openrouteservice-js';
import './MapComponent.css';

const orsDirections = new ORS.Directions({
    api_key: '5b3ce3597851110001cf6248b2b878a244324b52acd0d40f0fac5de3'
});

const generateCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

const MapComponent = () => {
    const mapRef = useRef(null);
    const [selectedBin, setSelectedBin] = useState(null);
    const [code, setCode] = useState('');
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
                        setCode(generateCode());
                        setSidebarVisible(true);
                    });

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestBin = bin;
                    }
                });
            }
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const center = [position.coords.longitude, position.coords.latitude];
                initializeMap(center);
            },
            (error) => {
                console.error('Error getting user location:', error);
            }
        );
    }, []);

    const handleDone = async () => {
        const donationData = {
            binName: selectedBin.name,
            binNumber: selectedBin.number,
            code: code,
            date: new Date().toISOString(),
        };

        console.log('Donation data:', donationData);

        setSidebarVisible(false);
        setSelectedBin(null);
        setCode('');
    };

    return (
        <div className="map-container">
            <div ref={mapRef} className="map"></div>
            {sidebarVisible && (
                <div className="sidebar">
                    <h2>Donate to Bin: {selectedBin.name}</h2>
                    <p>Your Code: <strong>{code}</strong></p>
                    <button onClick={handleDone}>Done</button>
                </div>
            )}
        </div>
    );
};

export default MapComponent;