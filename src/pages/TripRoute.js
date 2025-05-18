import React, { useEffect, useRef } from 'react';
import OLMap from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';
import { Extent } from 'ol/extent';
import 'ol/ol.css';
import './tripRoute.css';
import viewCuch from '../assets/ViewCuch.png';
import cityImage1 from '../assets/cities/Piter.png';
import cityImage2 from '../assets/cities/Novgorod.png';
import cityImage3 from '../assets/cities/Moscow.png';
import cityImage4 from '../assets/cities/Kazan.png';
import cityImage5 from '../assets/cities/Samara.jpeg';
import cityImage6 from '../assets/cities/Ufa.png';
import cityImage7 from '../assets/cities/EKB.png';
import cityImage8 from '../assets/cities/Chelyabinsk.png';
import cityImage9 from '../assets/cities/Novosib.png';
import cityImage10 from '../assets/cities/Altai.png';
import cityImage11 from '../assets/cities/Baikal.png';
import cityImage12 from '../assets/cities/Bator.png';
import cityImage13 from '../assets/cities/Pekin.png';

// Кастомная SVG-иконка для маркеров
const customIcon = new Icon({
    src:
        'data:image/svg+xml;base64,' +
        btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                <circle cx="12.5" cy="12.5" r="7.5" fill="#ff0000" fill-opacity="0.9"/>
                <circle cx="12.5" cy="12.5" r="9" fill="none" stroke="#ff0000" stroke-width="2" stroke-opacity="0.9"/>
                <circle cx="12.5" cy="12.5" r="10.5" fill="none" stroke="#ff0000" stroke-width="1" stroke-opacity="0.6"/>
            </svg>
        `),
    anchor: [0.5, 0.5],
    size: [25, 25],
});

const TripRoute = () => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const popupRef = useRef(null);
    const vectorLayerRef = useRef(null);
    const routeSourceRef = useRef(new VectorSource());

    const points = [
        { city: 'Saint Petersburg', lat: 59.9343, lng: 30.3351, image: cityImage1, info: "Saint Petersburg is the northern capital of Russia, founded by Peter the Great in 1703. The city is renowned for its canals, museums, and white nights, attracting millions of tourists. It marks the starting point of the Aptos Trip." },
        { city: 'Veliky Novgorod', lat: 58.521, lng: 31.2698, image: cityImage2, info: "Veliky Novgorod is one of the oldest cities in Russia, established in the 9th century. It preserves monuments of Ancient Rus, including the Saint Sophia Cathedral. The city is considered the cradle of Russian statehood. <span class='distance'>Distance 200 km</span>" },
        { city: 'Moscow', lat: 55.7558, lng: 37.6173, image: cityImage3, info: "Moscow, the capital of Russia, is the country's largest city, full of contrasts. Modern skyscrapers stand alongside historical landmarks like Red Square. It serves as the cultural and political heart of Russia. <span class='distance'>Distance 780 km</span>" },
        { city: 'Kazan', lat: 55.7903, lng: 49.1347, image: cityImage4, info: "Kazan, the capital of Tatarstan, is a city where Russian and Tatar cultures intertwine. Its historic center, including the Kazan Kremlin, is a UNESCO World Heritage site. Kazan is often called Russia's third capital. <span class='distance'>Distance 1590 km</span>" },
        { city: 'Samara', lat: 53.1959, lng: 50.1002, image: cityImage5, info: "Samara is a major city on the Volga River, known for its river port and contributions to space exploration. It boasts one of the longest embankments in Russia. The city attracts lovers of nature and history alike. <span class='distance'>Distance 1970 km</span>" },
        { city: 'Ufa', lat: 54.7388, lng: 55.9721, image: cityImage6, info: "Ufa, the capital of Bashkortostan, is surrounded by the picturesque Ural Mountains. The city is famous for its hospitality and national cuisine, especially Bashkir honey. It's a significant cultural hub in the region. <span class='distance'>Distance 2440 km</span>" },
        { city: 'Ekaterinburg', lat: 56.8389, lng: 60.6057, image: cityImage7, info: "Yekaterinburg is an industrial and cultural center of the Urals, often called the capital of the Ural Mountains. The city is known for its history tied to the Romanov royal family. It lies on the border between Europe and Asia. <span class='distance'>Distance 3000 km</span>" },
        { city: 'Chelyabinsk', lat: 55.1644, lng: 61.4368, image: cityImage8, info: "Chelyabinsk is a major industrial city located on the border of the Urals and Siberia. Surrounded by lakes and forests, it appeals to nature enthusiasts. The city is often referred to as the gateway to Siberia. <span class='distance'>Distance 3300 km</span>" },
        { city: 'Novosibirsk', lat: 55.0084, lng: 82.9357, image: cityImage9, info: "Novosibirsk is the largest city in Siberia and the third-largest in Russia. Situated on the Ob River, it's known for Akademgorodok, a scientific hub. It's a key transport node on the Trans-Siberian Railway. <span class='distance'>Distance 4800 km</span>" },
        { city: 'Gorno-Altaisk', lat: 51.9581, lng: 85.9603, image: cityImage10, info: "Gorno-Altaysk, the capital of the Altai Republic, is surrounded by mountains and natural beauty. The city serves as a gateway to the popular Altai Mountains for tourists. Here, you can experience the spirit of Altai culture. <span class='distance'>Distance 5300 km</span>" },
        { city: 'Irkutsk', lat: 52.2869, lng: 104.305, image: cityImage11, info: "Irkutsk is a historic Siberian city located near Lake Baikal. It's known for its wooden architecture and rich history. The city is often called the gateway to Baikal. <span class='distance'>Distance 7400 km</span>" },
        { city: 'Ulaanbaatar', lat: 47.9212, lng: 106.9057, image: cityImage12, info: "Ulan Bator, the capital of Mongolia, blends nomadic traditions with modernity. Surrounded by steppes and mountains, its center is adorned with Buddhist monasteries. It's a key stop on the journey to Asia. <span class='distance'>Distance 8400 km</span>" },
        { city: 'Beijing', lat: 39.9042, lng: 116.4074, image: cityImage13, info: "Beijing, the capital of China, is a city with a thousand-year history and modern skyscrapers. It's home to the famous Forbidden City and Tiananmen Square. This marks the final destination of the Aptos Trip. <span class='distance'>Distance 9800 km</span>" },
    ];

    useEffect(() => {
        if (!mapContainer.current) return;

        // Инициализация карты
        mapRef.current = new OLMap({
            target: mapContainer.current,
            layers: [
                new TileLayer({
                    source: new OSM(),
                    opacity: 1,
                }),
            ],
            view: new View({
                center: fromLonLat([(30.3351 + 116.4074) / 2, (59.9343 + 39.9042) / 2]),
                zoom: 3,
            }),
        });

        // Слой маршрута
        vectorLayerRef.current = new VectorLayer({
            source: routeSourceRef.current,
            zIndex: 15,
            style: new Style({
                stroke: new Stroke({
                    color: '#ff0000',
                    width: 5,
                }),
            }),
        });
        mapRef.current.addLayer(vectorLayerRef.current);

        // Слой маркеров
        const markerSource = new VectorSource();
        const markerLayer = new VectorLayer({
            source: markerSource,
            style: new Style({
                image: customIcon,
            }),
        });
        mapRef.current.addLayer(markerLayer);

        // Добавляем маркеры
        points.forEach((point) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([point.lng, point.lat])),
                city: point.city,
                image: point.image,
                info: point.info,
            });
            markerSource.addFeature(feature);
        });

        // Загрузка маршрута через серверную функцию Vercel
        const fetchRoute = async () => {
            const coords = points.map((point) => `${point.lng},${point.lat}`).join(';');
            try {
                const response = await fetch(
                    `/api/route?path=v1/driving/${coords}&overview=full&geometries=geojson`
                );
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (data.routes && data.routes.length > 0) {
                    const routeCoords = data.routes[0].geometry.coordinates.map((coord) =>
                        fromLonLat(coord)
                    );
                    const routeFeature = new Feature({
                        geometry: new LineString(routeCoords),
                    });
                    routeSourceRef.current.clear();
                    routeSourceRef.current.addFeature(routeFeature);

                    // Устанавливаем вид карты на весь маршрут
                    const extent = routeFeature.getGeometry().getExtent();
                    mapRef.current.getView().fit(extent, {
                        padding: [50, 50, 50, 50],
                        maxZoom: 5,
                        duration: 1000,
                    });
                } else {
                    throw new Error('No routes found in response');
                }
            } catch (error) {
                console.error('OSRM routing error:', error.message);
                // Fallback: прямая линия
                const fallbackCoords = points.map((p) => fromLonLat([p.lng, p.lat]));
                const fallbackFeature = new Feature({
                    geometry: new LineString(fallbackCoords),
                });
                routeSourceRef.current.clear();
                routeSourceRef.current.addFeature(fallbackFeature);
                const extent = fallbackFeature.getGeometry().getExtent();
                mapRef.current.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    maxZoom: 5,
                    duration: 1000,
                });
            }
        };

        fetchRoute();

        // Анимация маршрута
        let opacity = 0.8;
        const animateRoute = () => {
            if (!vectorLayerRef.current) return;
            opacity = opacity === 0.8 ? 0.4 : 0.8;
            vectorLayerRef.current.setStyle(
                new Style({
                    stroke: new Stroke({
                        color: `rgba(255, 0, 0, ${opacity})`,
                        width: 5,
                    }),
                })
            );
        };
        const intervalRoute = setInterval(animateRoute, 800);

        // Всплывающие окна
        const popup = new Overlay({
            element: popupRef.current,
            positioning: 'bottom-center',
            offset: [0, -15],
            stopEvent: false,
        });
        mapRef.current.addOverlay(popup);

        // Обработка клика по карте
        const handleMapClick = (event) => {
            const feature = mapRef.current.forEachFeatureAtPixel(event.pixel, (f) => {
                if (f.getGeometry().getType() === 'Point') return f;
            });
            if (feature) {
                const coordinates = feature.getGeometry().getCoordinates();
                mapRef.current.getView().animate({
                    center: coordinates,
                    zoom: 10,
                    duration: 1000,
                });
                const popupElement = popupRef.current;
                popupElement.style.opacity = '0';
                popupElement.style.transition = 'opacity 0.5s';
                popup.setPosition(coordinates);
                requestAnimationFrame(() => {
                    popupElement.style.opacity = '1';
                });
                const { city, image, info } = feature.getProperties();
                popupElement.innerHTML = `
                    <div class="popup-content custom-popup">
                        <img src="${image}" alt="${city}" class="popup-image" />
                        <div class="popup-text">${info}</div>
                    </div>
                `;
            } else {
                popup.setPosition(undefined);
                popupRef.current.style.opacity = '0';
            }
        };

        // Обработка клика за пределами карты
        const handleOutsideClick = (event) => {
            if (mapContainer.current) {
                const mapRect = mapContainer.current.getBoundingClientRect();
                if (
                    event.clientX < mapRect.left ||
                    event.clientX > mapRect.right ||
                    event.clientY < mapRect.top ||
                    event.clientY > mapRect.bottom
                ) {
                    popup.setPosition(undefined);
                    popupRef.current.style.opacity = '0';
                }
            }
        };

        // Адаптация карты при изменении размера окна
        const handleResize = () => {
            if (mapRef.current && mapContainer.current) {
                mapRef.current.updateSize();
            }
        };

        mapRef.current.on('singleclick', handleMapClick);
        document.addEventListener('click', handleOutsideClick);
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(intervalRoute);
            if (mapRef.current) {
                mapRef.current.setTarget(null);
            }
            document.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('resize', handleResize);
        };
    }, [points]);

    return (
        <div className="trip-route-page">
            <div className="content-wrapper">
                <div className="screen-image-container">
                    <img src={viewCuch} alt="Screen Background" className="screen-image" />
                    <div className="map-wrapper">
                        <div
                            ref={mapContainer}
                            id="map-container"
                            className="map-container"
                        />
                        <div ref={popupRef} className="popup" />
                    </div>
                </div>
                <a
                    href="https://www.youtube.com/@MR_Chaizy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-link"
                >
                    Watch on YouTube
                </a>
            </div>
        </div>
    );
};

export default TripRoute;