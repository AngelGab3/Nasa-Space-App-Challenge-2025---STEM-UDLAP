
mapboxgl.accessToken = 'pk.eyJ1Ijoic2ViYXN0aWFucmVuZWdoIiwiYSI6ImNtZ2VqdXI1ODAwczgycHB2Zmp4Zjh4bXAifQ.pKbgbQiDnVQ0L0SKv7ETPA';

const SUPABASE_URL = 'https://kqegcdizoltciupsozco.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZWdjZGl6b2x0Y2l1cHNvemNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzE2MzYsImV4cCI6MjA3NDk0NzYzNn0.9PKz0IAC_3_tgF6q-n8ruckfLSt5XOcGDVzHSTTZsaI';

let map;
let stationsData = [];
let is3D = true;

// Inicializar mapa
map = new mapboxgl.Map({
    container: 'map3d',
    style: 'mapbox://styles/mapbox/dark-v11', // Estilo oscuro para mejor contraste
    center: [-99.1332, 19.4326], // CDMX por defecto
    zoom: 5,
    pitch: 60, // Inclinación 3D
    bearing: 0
});

map.on('load', async () => {
    await loadStations();
    create3DLayer();
    wireUiControls();
});

async function loadStations() {
    try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/measurement_rt?select=*&ts=gte.${yesterday}&order=ts.desc&limit=500`,
            { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
        );
        
        const data = await response.json();
        
        // Agrupar por estación
        const stationMap = new Map();
        data.forEach(row => {
            if (!stationMap.has(row.station_id)) {
                stationMap.set(row.station_id, row);
            }
        });
        
        stationsData = Array.from(stationMap.values());
        console.log(`Loaded ${stationsData.length} stations`);
        
    } catch (error) {
        console.error('Error loading stations:', error);
    }
}

function getMaxAQI(station) {
    const vals = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co']
        .map(k => station[k])
        .filter(v => v != null && !isNaN(v) && v >= 0)
        .map(v => Number(v));
    return vals.length ? Math.max(...vals) : 50;
}

function getAQIColor(aqi) {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
}

function create3DLayer() {
    // Convertir estaciones a GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        features: stationsData.map(st => {
            const aqi = getMaxAQI(st);
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [Number(st.lon), Number(st.lat)]
                },
                properties: {
                    aqi: aqi,
                    height: aqi * 100, // Altura proporcional al AQI
                    color: getAQIColor(aqi),
                    name: st.station_id
                }
            };
        })
    };
    
    // Agregar source
    map.addSource('stations', {
        type: 'geojson',
        data: geojson
    });
    
    // Capa de extrusión 3D (columnas)
    map.addLayer({
        id: 'stations-3d',
        type: 'fill-extrusion',
        source: 'stations',
        paint: {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.8
        }
    });
    
    // Capa de círculos en la base
    map.addLayer({
        id: 'stations-base',
        type: 'circle',
        source: 'stations',
        paint: {
            'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 8,
                10, 15
            ],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.6,
            'circle-blur': 0.5
        }
    });
    
    // Popup al hacer click
    map.on('click', 'stations-3d', (e) => {
        const props = e.features[0].properties;
        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <strong>${props.name}</strong><br>
                AQI: ${props.aqi}<br>
                Height: ${Math.round(props.height)}m
            `)
            .addTo(map);
    });
    
    map.on('mouseenter', 'stations-3d', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'stations-3d', () => {
        map.getCanvas().style.cursor = '';
    });

    // update visible count initially
    try { updateVisibleCount(); } catch(e) {}
}

// Update the stations source data applying an AQI threshold filter
function updateStationsSource(threshold = 0) {
    try {
        const filtered = {
            type: 'FeatureCollection',
            features: stationsData.map(st => {
                const aqi = getMaxAQI(st);
                return {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [Number(st.lon), Number(st.lat)] },
                    properties: { aqi: aqi, height: aqi * 100, color: getAQIColor(aqi), name: st.station_id }
                };
            }).filter(f => f.properties.aqi >= threshold)
        };

        const src = map.getSource('stations');
        if (src && src.setData) src.setData(filtered);
        updateVisibleCount();
    } catch (e) { console.warn('updateStationsSource failed', e); }
}

function updateVisibleCount() {
    try {
        const src = map.getSource('stations');
        let count = 0;
        if (src && src._data && src._data.features) count = src._data.features.length;
        const el = document.getElementById('visible-count'); if (el) el.textContent = String(count);
    } catch (e) {}
}

function wireUiControls() {
    try {
        const slider = document.getElementById('aqi-threshold');
        const sliderVal = document.getElementById('aqi-threshold-value');
        const toggle = document.getElementById('toggle-extrusion');
        const highlightBtn = document.getElementById('highlight-worst');

        if (slider) {
            slider.addEventListener('input', (e) => {
                const v = Number(e.target.value || 0);
                if (sliderVal) sliderVal.textContent = String(v);
                updateStationsSource(v);
            });
        }

        if (toggle) {
            toggle.addEventListener('change', (e) => {
                const enabled = e.target.checked;
                try {
                    if (map.getLayer('stations-3d')) map.setLayoutProperty('stations-3d', 'visibility', enabled ? 'visible' : 'none');
                    if (map.getLayer('stations-base')) map.setLayoutProperty('stations-base', 'visibility', enabled ? 'visible' : 'none');
                } catch(e) {}
            });
        }

        if (highlightBtn) {
            highlightBtn.addEventListener('click', () => {
                // briefly animate the worst station by flying to it and adding a pulsing marker
                if (!stationsData || stationsData.length === 0) return;
                const worst = stationsData.reduce((max, st) => {
                    const aqi = getMaxAQI(st);
                    return !max || aqi > getMaxAQI(max) ? st : max;
                }, null);
                if (!worst) return;
                const lng = Number(worst.lon); const lat = Number(worst.lat);
                map.flyTo({ center: [lng, lat], zoom: 12, pitch: 70, bearing: 45, duration: 2000 });
                // create a pulsing element
                const el = document.createElement('div');
                el.style.width = '24px'; el.style.height = '24px'; el.style.borderRadius = '50%';
                el.style.background = 'rgba(255, 30, 30, 0.9)'; el.style.boxShadow = '0 0 18px 6px rgba(255,30,30,0.25)';
                const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
                setTimeout(() => { try { marker.remove(); } catch(e) {} }, 5000);
            });
        }

    } catch (e) { console.warn('wireUiControls failed', e); }
}

// Controles
function togglePitch() {
    is3D = !is3D;
    map.easeTo({
        pitch: is3D ? 60 : 0,
        duration: 1000
    });
}

let rotating = false;
function rotateCamera() {
    if (rotating) return;
    rotating = true;
    
    function rotate() {
        if (!rotating) return;
        map.rotateTo(map.getBearing() + 90, { duration: 3000 });
        setTimeout(rotate, 3000);
    }
    
    rotate();
    
    setTimeout(() => {
        rotating = false;
    }, 12000);
}

function flyToWorst() {
    if (stationsData.length === 0) return;
    
    const worst = stationsData.reduce((max, st) => {
        const aqi = getMaxAQI(st);
        return aqi > getMaxAQI(max) ? st : max;
    });
    
    map.flyTo({
        center: [Number(worst.lon), Number(worst.lat)],
        zoom: 12,
        pitch: 70,
        bearing: 45,
        duration: 3000
    });
}

function resetView() {
    rotating = false;
    map.flyTo({
        center: [-99.1332, 19.4326],
        zoom: 5,
        pitch: 60,
        bearing: 0,
        duration: 2000
    });
}