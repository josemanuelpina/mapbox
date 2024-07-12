mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNsd3J3dzdyYzA0YW0ya3NkNnBhMG1sNGMifQ.w7ark0p58_zWpTcCFMqy6g';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/datosrtve/clxonal6100lj01qrc9lo0kk2',
    center: [-3.7038, 40.4168],
    zoom: 5
});

let hoverActualID = null; // Variable global para almacenar el ID del punto sobre el que se hace hover

// Carga de datos CSV y conversión a GeoJSON
function dataCSV(url) {
    return d3.csv(url).then(data => {
        const geojson = {
            type: "FeatureCollection",
            features: data.map(d => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [parseFloat(d.X), parseFloat(d.Y)]
                },
                properties: {
                    OBJECTID: d.OBJECTID,
                    nombre_completo: d.nombre_completo,
                    nombre_mun: d.nombre_mun,
                    comunidad: d.Comunidad,
                    provincia_isla: d.Provincia_isla,
                    municipio: d.Municipio,
                    equipamiento: parseFloat(d.slider_equipamiento),
                    ocupacion: d.slider_ocupacion,
                    accesible_sillas_ruedas: d.filtro_accesible_sillas_ruedas === 's',
                    aseos: d.filtro_aseos === 's',
                    alquiler_sombrillas_hamacas: d.filtro_alquiler_sombrillas_hamacas === 's',
                    aparcamiento: d.filtro_aparcamiento === 's',
                    chiringuito: d.filtro_chiringuito === 's',
                    duchas_lavapies: d.filtro_duchas_lavapies === 's',
                    socorrista: d.filtro_socorrista === 's',
                    zona_infantil: d.filtro_zona_infantil === 's',
                    aguas_tranquilas: d.filtro_aguas_tranquilas === 's',
                    baja_ocupacion: d.filtro_baja_ocupacion === 's',
                    banderas_azules: d.filtro_banderas_azules === 's',
                    nudista: d.filtro_nudista === 's',
                    playa_piedras: d.filtro_playa_piedras === 's',
                    playa_arena: d.filtro_playa_arena === 's',
                    extensas_1km: d.filtro_extensas_1km === 's',
                    acantilado_montana: d.filtro_acantilado_montana === 's',
                    dunas: d.filtro_dunas === 's',
                    paseo_completo: d.filtro_paseo_completo === 's',
                    playa_aislada: d.filtro_playa_aislada === 's',
                    alquiler_nautico: d.filtro_alquiler_nautico === 's',
                    club_nautico: d.filtro_club_nautico === 's',
                    fondo_barcos: d.filtro_fondo_barcos === 's',
                    submarinismo: d.filtro_submarinismo === 's',
                    surf: d.filtro_surf === 's',
                    zona_deportiva: d.filtro_zona_deportiva === 's',
                    tipo_playa: d.ficha_tipo_playa,
                    longitud: d.ficha_longitud,
                    anchura_max: d.ficha_anchura_max,
                    entorno: d.ficha_entorno,
                    hospital: d.hospital,
                    distancia_hospital: d.distancia_hospital,
                    carretera: d.carretera,
                    formas_acceso: d.formas_acceso,
                    transporte_publico: d.transporte_publico,
                    advertencia_acceso: d.advertencia_acceso,
                    oleaje: d.ficha_oleaje,
                    urbanizacion: d.ficha_urbanizacion,
                    entorno_protegido: d.ficha_entorno_protegido,
                    foto: d.foto
                }
            }))
        };
        return geojson;
    });
}

dataCSV('https://raw.githubusercontent.com/datosrtve/opendata/main/2024/mapa%20playas/filtros_playas_prueba_foto.csv')
    .then(geojson => {
        window.geojson = geojson; //Con window está disponible en ámbito global
        
        // Función personalizada para el geocoder
        function dataGeocoder(query) {
            var features = [];
            var datosGeocoder = geojson.features;
            for (var i = 0; i < datosGeocoder.length; i++) {
                var feature = datosGeocoder[i];
                var nombrePlaya = feature.properties.nombre_mun ? feature.properties.nombre_mun.toLowerCase() : '';
                if (nombrePlaya.indexOf(query.toLowerCase()) !== -1) {
                    feature['place_name'] = feature.properties.nombre_mun;
                    feature['center'] = feature.geometry.coordinates;
                    features.push(feature);
                }
            }
            return features;
        }

        let geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            localGeocoder: dataGeocoder,
            clearOnBlur: true,
            localGeocoderOnly: false,
            flyto: {
                padding: 15,
                easing: function (t) {
                    return t;
                },
                maxZoom: 15,
            },
            countries: "es",
            language: "es",
            types: "region, place, neighborhood",
            marker: true,
            placeholder: "Buscar playa"
        });

        document.getElementById("geocoder").appendChild(geocoder.onAdd(map));

        var geocoderInput = document.querySelector('.mapboxgl-ctrl-geocoder--input');
        geocoderInput.addEventListener('click', function () {
            geocoder.clear();
        });

        map.on('load', function () {
            map.addSource('playas', {
                type: 'geojson',
                data: geojson,
                promoteId: 'OBJECTID' // OBJECTID como identificador único
            });

            map.addLayer({
                id: 'playas-layer',
                type: 'circle',
                source: 'playas',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        5, [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            9,
                            4.5
                        ],
                        10, [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            20,
                            10
                        ],
                        15, [
                            'case',
                            ['boolean', ['feature-state', 'hover'], false],
                            30,
                            15
                        ]
                    ],
                    'circle-color': [
                        'match',
                        ['get', 'ocupacion'],
                        'Bajo', '#00FF00',
                        'Medio', '#FFFF00',
                        'Alto', '#FF0000',
                        '#007cbf'
                    ],
                    'circle-stroke-width': [
                        'interpolate', ['linear'], ['zoom'],
                        5, 0.2,
                        10, 0.8,
                        15, 1
                    ],
                    'circle-stroke-color': '#FFFFFF'
                }
            });

            // Ocultar el loader después de que el mapa y las capas se hayan cargado
            map.on('data', function (e) {
                if (e.dataType === 'source' && e.sourceId === 'playas' && map.isSourceLoaded('playas')) {
                    // Ocultar el loader después de 3 segundos
                    setTimeout(() => {
                        document.getElementById('loader-container').style.display = 'none';
                    }, 3000);
                }
            });

            const filters = {
                nombre_completo: document.getElementById('nombre_completo'),
                nombre_mun: document.getElementById('nombre_mun'),
                comunidad: document.getElementById('comunidad'),
                provincia_isla: document.getElementById('provincia_isla'),
                municipio: document.getElementById('municipio'),
                equipamiento: document.getElementById('slider_equipamiento'),
                ocupacion: document.getElementById('slider_ocupacion'),
                accesible_sillas_ruedas: document.getElementById('filtro_accesible_sillas_ruedas'),
                aseos: document.getElementById('filtro_aseos'),
                alquiler_sombrillas_hamacas: document.getElementById('filtro_alquiler_sombrillas_hamacas'),
                aparcamiento: document.getElementById('filtro_aparcamiento'),
                chiringuito: document.getElementById('filtro_chiringuito'),
                duchas_lavapies: document.getElementById('filtro_duchas_lavapies'),
                socorrista: document.getElementById('filtro_socorrista'),
                zona_infantil: document.getElementById('filtro_zona_infantil'),
                aguas_tranquilas: document.getElementById('filtro_aguas_tranquilas'),
                baja_ocupacion: document.getElementById('filtro_baja_ocupacion'),
                banderas_azules: document.getElementById('filtro_banderas_azules'),
                nudista: document.getElementById('filtro_nudista'),
                playa_piedras: document.getElementById('filtro_playa_piedras'),
                playa_arena: document.getElementById('filtro_playa_arena'),
                extensas_1km: document.getElementById('filtro_extensas_1km'),
                acantilado_montana: document.getElementById('filtro_acantilado_montana'),
                dunas: document.getElementById('filtro_dunas'),
                paseo_completo: document.getElementById('filtro_paseo_completo'),
                playa_aislada: document.getElementById('filtro_playa_aislada'),
                alquiler_nautico: document.getElementById('filtro_alquiler_nautico'),
                club_nautico: document.getElementById('filtro_club_nautico'),
                fondo_barcos: document.getElementById('filtro_fondo_barcos'),
                submarinismo: document.getElementById('filtro_submarinismo'),
                surf: document.getElementById('filtro_surf'),
                zona_deportiva: document.getElementById('filtro_zona_deportiva')
            };

            function aplicaFiltros() {
                document.getElementById('skeleton-container').style.display = 'block';
                const bounds = map.getBounds();
                const featuresFiltradas = geojson.features.filter(feature => {
                    const props = feature.properties;
                    const coords = feature.geometry.coordinates;
                    return (
                        coords[0] >= bounds.getWest() &&
                        coords[0] <= bounds.getEast() &&
                        coords[1] >= bounds.getSouth() &&
                        coords[1] <= bounds.getNorth() &&
                        (!filters.nombre_completo || !filters.nombre_completo.value || props.nombre_completo.includes(filters.nombre_completo.value)) &&
                        (!filters.comunidad || !filters.comunidad.value || props.comunidad === filters.comunidad.value) &&
                        (!filters.provincia_isla || !filters.provincia_isla.value || props.provincia_isla === filters.provincia_isla.value) &&
                        (!filters.municipio || !filters.municipio.value || props.municipio === filters.municipio.value) &&
                        (!filters.equipamiento || filters.equipamiento.value === "" || props.equipamiento >= parseFloat(filters.equipamiento.value)) &&
                        (!filters.ocupacion || !filters.ocupacion.value || props.ocupacion === filters.ocupacion.value) &&
                        (!filters.accesible_sillas_ruedas || !filters.accesible_sillas_ruedas.checked || (props.accesible_sillas_ruedas !== undefined && props.accesible_sillas_ruedas)) &&
                        (!filters.aseos || !filters.aseos.checked || (props.aseos !== undefined && props.aseos)) &&
                        (!filters.alquiler_sombrillas_hamacas || !filters.alquiler_sombrillas_hamacas.checked || (props.alquiler_sombrillas_hamacas !== undefined && props.alquiler_sombrillas_hamacas)) &&
                        (!filters.aparcamiento || !filters.aparcamiento.checked || (props.aparcamiento !== undefined && props.aparcamiento)) &&
                        (!filters.chiringuito || !filters.chiringuito.checked || (props.chiringuito !== undefined && props.chiringuito)) &&
                        (!filters.duchas_lavapies || !filters.duchas_lavapies.checked || (props.duchas_lavapies !== undefined && props.duchas_lavapies)) &&
                        (!filters.socorrista || !filters.socorrista.checked || (props.socorrista !== undefined && props.socorrista)) &&
                        (!filters.zona_infantil || !filters.zona_infantil.checked || (props.zona_infantil !== undefined && props.zona_infantil)) &&
                        (!filters.aguas_tranquilas || !filters.aguas_tranquilas.checked || (props.aguas_tranquilas !== undefined && props.aguas_tranquilas)) &&
                        (!filters.baja_ocupacion || !filters.baja_ocupacion.checked || (props.baja_ocupacion !== undefined && props.baja_ocupacion)) &&
                        (!filters.banderas_azules || !filters.banderas_azules.checked || (props.banderas_azules !== undefined && props.banderas_azules)) &&
                        (!filters.nudista || !filters.nudista.checked || (props.nudista !== undefined && props.nudista)) &&
                        (!filters.playa_piedras || !filters.playa_piedras.checked || (props.playa_piedras !== undefined && props.playa_piedras)) &&
                        (!filters.playa_arena || !filters.playa_arena.checked || (props.playa_arena !== undefined && props.playa_arena)) &&
                        (!filters.extensas_1km || !filters.extensas_1km.checked || (props.extensas_1km !== undefined && props.extensas_1km)) &&
                        (!filters.acantilado_montana || !filters.acantilado_montana.checked || (props.acantilado_montana !== undefined && props.acantilado_montana)) &&
                        (!filters.dunas || !filters.dunas.checked || (props.dunas !== undefined && props.dunas)) &&
                        (!filters.paseo_completo || !filters.paseo_completo.checked || (props.paseo_completo !== undefined && props.paseo_completo)) &&
                        (!filters.playa_aislada || !filters.playa_aislada.checked || (props.playa_aislada !== undefined && props.playa_aislada)) &&
                        (!filters.alquiler_nautico || !filters.alquiler_nautico.checked || (props.alquiler_nautico !== undefined && props.alquiler_nautico)) &&
                        (!filters.club_nautico || !filters.club_nautico.checked || (props.club_nautico !== undefined && props.club_nautico)) &&
                        (!filters.fondo_barcos || !filters.fondo_barcos.checked || (props.fondo_barcos !== undefined && props.fondo_barcos)) &&
                        (!filters.submarinismo || !filters.submarinismo.checked || (props.submarinismo !== undefined && props.submarinismo)) &&
                        (!filters.surf || !filters.surf.checked || (props.surf !== undefined && props.surf)) &&
                        (!filters.zona_deportiva || !filters.zona_deportiva.checked || (props.zona_deportiva !== undefined && props.zona_deportiva))
                    );
                });

                // Muestra el skeleton
                document.getElementById('skeleton-container').style.display = 'block';
                document.getElementById('points-list').style.display = 'none';

                // Actualización de los datos del mapa con las features filtradas
                map.getSource('playas').setData({
                    type: "FeatureCollection",
                    features: featuresFiltradas
                });

                // Oculta el skeleton después de la actualización de los datos
                setTimeout(() => {
                    document.getElementById('skeleton-container').style.display = 'none';
                    document.getElementById('points-list').style.display = 'block';
                listaVisible(featuresFiltradas);
                }, 500);
            }

            // Función para actualizar la lista de puntos visibles
            function listaVisible(features) {
                const listaPuntos = document.getElementById('points-list');
                const playasCount = document.getElementById('contador-playas');
                listaPuntos.innerHTML = ''; // Limpia la lista actual

                // Actualiza el contador de playas
                playasCount.innerHTML = `
                    <span>Mostrando ${features.length} playas</span>
                    <button>
                        Cómo ordenamos los resultados
                    </button>`;

                // Ordena las features por equipamiento
                const ordenaFeatures = features.sort((a, b) => b.properties.equipamiento - a.properties.equipamiento);

                // Crea elementos para cada feature y los agrega a la lista
                ordenaFeatures.forEach(feature => {
                    const item = document.createElement('li');
                    item.className = 'list-item in__main__list_item';
                    item.setAttribute('data-id', feature.properties.OBJECTID);
            
                    // Contar servicios disponibles
                    const servicios = [
                        'aseos', 'alquiler_sombrillas_hamacas', 'aparcamiento', 'chiringuito', 
                        'duchas_lavapies', 'socorrista', 'zona_infantil', 'aguas_tranquilas', 
                        'baja_ocupacion', 'banderas_azules', 'nudista', 'playa_piedras', 
                        'playa_arena', 'extensas_1km', 'acantilado_montana', 'dunas', 
                        'paseo_completo', 'playa_aislada', 'alquiler_nautico', 'club_nautico', 
                        'fondo_barcos', 'submarinismo', 'surf', 'zona_deportiva'
                    ];
                    const serviciosDisponibles = servicios.filter(servicio => feature.properties[servicio]).length;
            
                    // Crear contenido del ítem
                    let itemContent = `
                        <div class="in__item_card">
                            <div class="in__item_card_image">
                                ${feature.properties.foto ? `<img src="${feature.properties.foto}" alt="${feature.properties.nombre_completo}">` : ''}
                                <div class="in__item_card_ranking">
                                    </span> <span>${feature.properties.equipamiento}</span><span class="in__icon">
                                </div>
                            </div>
                            <div class="in__item_card_footer">
                                <div class="in__item_card_title">
                                    <h2>${feature.properties.nombre_completo} <span>${feature.properties.municipio} (${feature.properties.provincia_isla})</span></h2>
                                </div>
                                <div class="in__item_card_services">
                                   <!-- ${feature.properties.banderas_azules ? `<img src="./svg/icon_ bandera azulSize=XS.svg" alt="Bandera Azul">` : ''}-->
                                    <span style="">${serviciosDisponibles} servicios</span>
                                    <button style="background: none; border: none; color: #ff7f50; cursor: pointer; margin-left: 10px;">Colabora</button>
                                </div>
                            </div>
                        </div>
                    `;

                    item.innerHTML = itemContent;
                    listaPuntos.appendChild(item);

                    item.addEventListener('mouseenter', () => {
                        hoverActualID = feature.properties.OBJECTID;
                        map.setFeatureState(
                            { source: 'playas', id: hoverActualID },
                            { hover: true }
                        );
                    });

                    item.addEventListener('mouseleave', () => {
                        if (hoverActualID !== null) {
                            map.setFeatureState(
                                { source: 'playas', id: hoverActualID },
                                { hover: false }
                            );
                            hoverActualID = null;
                        }
                    });

                    item.addEventListener('click', () => {
                        mostrarDetallePlaya(feature);
                    });
                });
            }

            // Filtros cuando se mueve el mapa
            map.on('moveend', function () {
                aplicaFiltros();
            });

            // event listeners a los filtros para cuando cambian
            Object.values(filters).forEach(filter => {
                if (filter) {
                    if (filter.type === 'checkbox' || filter.type === 'range' || filter.tagName === 'SELECT') {
                        filter.addEventListener('change', aplicaFiltros);
                    } else {
                        filter.addEventListener('input', aplicaFiltros);
                    }
                }
            });

            aplicaFiltros();

            // Tooltip
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('mouseenter', 'playas-layer', function (e) {
                map.getCanvas().style.cursor = 'pointer';

                const properties = e.features[0].properties;
                const pointId = e.features[0].properties.OBJECTID;
                hoverActualID = pointId;

                // Aumentar el tamaño del punto en el mapa
                map.setFeatureState(
                    { source: 'playas', id: pointId },
                    { hover: true }
                );

                // Resaltar el elemento correspondiente en la lista
                const listItem = document.querySelector(`.list-item[data-id="${pointId}"]`);
                if (listItem) {
                    listItem.classList.add('resaltado-list-item');
                }

                // Configura el contenido del popup
                popup.setLngLat(e.lngLat)
                    .setHTML(`
                        <strong>${properties.nombre_completo}</strong><br>
                        Provincia/Isla: ${properties.provincia_isla}<br>
                        Municipio: ${properties.municipio}<br>
                        Equipamiento: ${properties.equipamiento}<br>
                        Ocupación: ${properties.ocupacion}
                    `)
                    .addTo(map);
            });

            map.on('mouseleave', 'playas-layer', function () {
                map.getCanvas().style.cursor = '';

                if (hoverActualID !== null) {
                    // Reducir el tamaño del punto en el mapa
                    map.setFeatureState(
                        { source: 'playas', id: hoverActualID },
                        { hover: false }
                    );

                    // Quitar el resaltado del elemento correspondiente en la lista
                    const listItem = document.querySelector(`.list-item[data-id="${hoverActualID}"]`);
                    if (listItem) {
                        listItem.classList.remove('resaltado-list-item');
                    }
                    hoverActualID = null;
                }

                popup.remove();
            });

            map.on('click', 'playas-layer', function (e) {
                const properties = e.features[0].properties;
                const datosPlaya = geojson.features.find(feature => feature.properties.OBJECTID === properties.OBJECTID);
                if (datosPlaya) {
                    mostrarDetallePlaya(datosPlaya);
                }
            });
        }).catch(error => {
        console.error('Error al cargar los datos:', error);
    });

window.addEventListener('error', function (event) {
    console.error('Error capturado:', event.error);
});

// Botones
// Cantábrico
document.getElementById('btn-cantabrico').addEventListener('click', function () {
    map.flyTo({ center: [-4.4799, 42.5677], zoom: 6.32 });
});
//Baleares
document.getElementById('btn-baleares').addEventListener('click', function () {
    map.flyTo({ center: [2.7646, 39.0653], zoom: 7.09 });
});
//Canarias
document.getElementById('btn-canarias').addEventListener('click', function () {
    map.flyTo({ center: [-15.7606, 28.2768], zoom: 6.35 });
});
//Mediterráneo
document.getElementById('btn-andalucia-murcia').addEventListener('click', function () {
    map.flyTo({ center: [1.3730, 39.7631], zoom: 6.22 });
});
//Costa Andaluza
document.getElementById('btn-baleares-cvalenciana').addEventListener('click', function () {
    map.flyTo({ center: [-4.3711, 36.2099], zoom: 6.28 });
});
//Costa Gallega
document.getElementById('btn-cataluna').addEventListener('click', function () {
    map.flyTo({ center: [-8.1351, 42.8307], zoom: 7.59 });
});

        map.on('move', function () {
    var center = map.getCenter();
    console.log('Longitud: ' + center.lng.toFixed(4) + ', Latitud: ' + center.lat.toFixed(4));
    
    var zoom = map.getZoom();
    console.log('Zoom: ' + zoom.toFixed(2));
});

});


