document.addEventListener("DOMContentLoaded", function () {
    const infoTooltip = document.getElementById('info-tooltip');
    let startY;

    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
    }

    // Función para manejar el movimiento del dedo
    function handleTouchMove(e) {
        if (!startY) {
            return;
        }

        let y = e.touches[0].clientY;
        let change = startY - y;

        if (Math.abs(change) > 30) { // Umbral de movimiento para activar la animación
            // Swipe hacia arriba
            if (change > 0) {
                infoTooltip.style.bottom = '0vh';
            }
            // Swipe hacia abajo
            else {
                infoTooltip.style.bottom = '-60vh';
            }
        }
    }

    infoTooltip.addEventListener('touchstart', handleTouchStart, false);
    infoTooltip.addEventListener('touchmove', handleTouchMove, false);



    mapboxgl.accessToken = 'pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNsbWh3dzBnbzJxaW4zZG81dnRlMHpqdm4ifQ.i3SdiqKN_-sBlD3JNABQJg';

    let defaultTablaData = {};
    let defaultEdadMediaData = {};
    let defaultPorcentajeData = {};
    const poblacionTotal = 47475420;
    const formatPoblacionTotal = poblacionTotal.toLocaleString('es-ES');  // "47.475.420"
    let datosVehiculos;

    // Carga de datos CSV
    d3.csv('https://raw.githubusercontent.com/datosrtve/opendata/main/2023/distintivos-ambientales-dgt/vehiculos-es-wide.csv').then(data => {
        defaultTablaData = data[0]; defaultData = data[0];
        datosVehiculos = data;
        for (let key in defaultData) {
            if (!isNaN(defaultData[key])) {
                defaultData[key] = +defaultData[key];  // Cadenas numéricas a números
            }
        }
        // Completa defaultEdadMediaData y defaultPorcentajeData
        data.forEach(row => {
            defaultEdadMediaData[row.tipo_vehiculo] = row;
            defaultPorcentajeData[row.tipo_vehiculo] = row;
        });


        const layersDistintivo = {};

        const bounds = [
            [-104.1059556369808, -7.481376773454173],
            [106.83154436302016, 68.58881756396005]
        ];

        let isMobile = false;
        if (Detectizr.device.type == 'mobile') {
            isMobile = true;
        }

        let initialZoom = isMobile ? 5 : 5.8;
        let initialCenter = isMobile ? [-3.3292966493690983, 40.06720017596038] : [-4.02502, 39.95027];

        const vehiculosConfig = {
            turismos: {
                source: '2023-09-AMBIENTALES-TURISMOS-7ecpla',
                url: 'mapbox://datosrtve.drvskmtf',
                layer: 'vehiculosturismoswide',
                distint: ['SIN', 'B', 'C', 'CERO', 'ECO']
            },

            motocicletas: {
                source: '2023-09-AMBIENTALES-MOTOCICLE-dotpl5',
                url: 'mapbox://datosrtve.boz8u78z',
                layer: 'vehiculosmotocicletaswide',
                distint: ['SIN', 'B', 'C', 'ECO', 'CERO']
            },
            camiones: {
                source: '2023-09-AMBIENTALES-CAMIONES-8j3yhg',
                url: 'mapbox://datosrtve.0wfhme9r',
                layer: 'vehiculoscamioneswide',
                distint: ['SIN', 'B', 'C', 'ECO', 'CERO']
            },
            autobuses: {
                source: '2023-09-AMBIENTALES-AUTOBUSES-7j2z01',
                url: 'mapbox://datosrtve.0c9yo383',
                layer: 'vehiculosautobusesotroswide',
                distint: ['SIN', 'B', 'C', 'ECO', 'CERO']
            },
            furgonetas: {
                source: '2023-09-AMBIENTALES-FURGONETA-dlt3lg', //'2023-09-AMBIENTALES-FURGONETA-8j3yhg'
                url: 'mapbox://datosrtve.0vvcquz7',
                layer: 'vehiculosfurgonetaswide',
                distint: ['SIN', 'B', 'C', 'ECO', 'CERO']
            },
            tractores: {
                source: '2023-09-AMBIENTALES-TRACTORES-9dqe1r',
                url: 'mapbox://datosrtve.cy4l4jis',
                layer: 'vehiculostractoresremolqueswide',
                distint: ['SIN', 'B', 'C', 'ECO', 'CERO']
            },
            todos: {
                source: '2023-09-AMBIENTALES-TODOS-0gnnyl',
                url: 'mapbox://datosrtve.15bybdbh',
                layer: 'vehiculostodoswide',
                distint: ['SIN', 'B', 'C', 'ECO', 'CERO']
            }
        }

        const porDistMapping = {
            'SIN': 'por_dist_SIN_DISTINTIVO',
            'B': 'por_dist_DISTINTIVO_B',
            'C': 'por_dist_DISTINTIVO_C',
            'ECO': 'por_dist_ECO',
            'CERO': 'por_dist_CERO',
            'TODOS': 'por_dist_TODOS'
        };

        const numDistMapping = {
            'SIN': 'num_dist_SIN_DISTINTIVO',
            'B': 'num_dist_DISTINTIVO_B',
            'C': 'num_dist_DISTINTIVO_C',
            'ECO': 'num_dist_ECO',
            'CERO': 'num_dist_CERO',
        };

        const colorSchemeMapping = {
            'SIN': ['#eef2f2', '#d9dcdc', '#c4c6c6', '#b0b1b1', '#9c9c9c', '#5f5f5f', '#1c1d1d'],
            'B': ['#e3e0b0', '#eae493', '#f1e873', '#f8eb4e', '#ffee04', '#948b10', '#322F0A'],
            'C': ['#F4FAF0', '#d3e9c4', '#b2d798', '#90c66d', '#6db43f', '#406b27', '#192a0f'],
            'ECO': ['#9fdcdd', '#81c2c3', '#62a8a9', '#438f90', '#1f7778', '#165253', '#0c3030'],
            'CERO': ['#add7eb', '#8abfdb', '#66a7cc', '#5ba0c7', '#0077af', '#035376', '#0b3042'],
        };

        const colorDispositivo = {
            'SIN': '#9c9c9c',
            'B': '#ffee04',
            'C': '#6db43f',
            'ECO': '#1f7778',
            'CERO': '#0077af',
        };


        const propMapping = {
            'SIN': 'SIN_DISTINTIVO',
            'B': 'DISTINTIVO_B',
            'C': 'DISTINTIVO_C',
            'ECO': 'ECO',
            'CERO': 'CERO',
            'TODOS': 'TODOS'
        };

        //Colores medios
        const colors = {
            'SIN': colorSchemeMapping['SIN'][3],
            'B': colorSchemeMapping['B'][3],
            'C': colorSchemeMapping['C'][3],
            'ECO': colorSchemeMapping['ECO'][3],
            'CERO': colorSchemeMapping['CERO'][3],
        };


        const numCero = Number(defaultTablaData['num_dist22_CERO']) || 0;
        const numDistB = Number(defaultTablaData['num_dist22_DISTINTIVO B']) || 0;
        const numDistC = Number(defaultTablaData['num_dist22_DISTINTIVO C']) || 0;
        const numEco = Number(defaultTablaData['num_dist22_ECO']) || 0;
        const numSin = Number(defaultTablaData['num_dist22_DISTINTIVO SIN']) || 0;




        let numTotal = numCero + numDistB + numDistC + numEco + numSin;


        // Calculo porcentajes para cada distintivo
        let porcentajesDefault = {
            'SIN': (defaultTablaData['num_dist22_DISTINTIVO SIN'] / numTotal * 100) || 0,
            'B': (defaultTablaData['num_dist22_DISTINTIVO B'] / numTotal * 100) || 0,
            'C': (defaultTablaData['num_dist22_DISTINTIVO C'] / numTotal * 100) || 0,
            'ECO': (defaultTablaData['num_dist22_ECO'] / numTotal * 100) || 0,
            'CERO': (defaultTablaData['num_dist22_CERO'] / numTotal * 100) || 0,
        };







        let distintivoActual = 'SIN';
        let tiposAreas = seleccionAreas(); // Inicialización con todos los tipos de área seleccionados

        let edadMediaGlobal = null;
        let edadMediaNacionalGlobal = null;
        let propsGlobales = {};

        /*document.querySelectorAll('.filter-buttons input[type=radio]').forEach((radio) => {
            radio.addEventListener('change', (event) => {
                distintivoActual = event.target.dataset.distintivo;
                if (propsGlobales) {
                    const mappedDistintivo = propMapping[distintivoActual];
                    edadMediaGlobal = propsGlobales[`edad_media_${mappedDistintivo}`];
                    edadMediaNacionalGlobal = propsGlobales[`em_nacional_${mappedDistintivo}`];

                    tooltipEdadMediaDefault(edadMediaGlobal, edadMediaNacionalGlobal, distintivoActual);
                }

                //document.getElementById('displayed-distintivo').textContent = `DISTINTIVO ${distintivoActual}`;
                actualizaLayersDistintivo(distintivoActual);
                //tooltipEdadMediaDefault(edadMediaGlobal, edadMediaNacionalGlobal, distintivoActual);
                actualizaLegenda(distintivoActual);
                if (datosVehiculos) {
                    const totalVehiculos = calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual);
                    document.getElementById('tooltip-tot_vehi').innerHTML = totalVehiculos + ' veh.';
                }
            });
        });*/

        document.querySelectorAll('.menu-buttonDistintivo').forEach((button) => {
            button.addEventListener('click', (event) => {
                distintivoActual = event.target.dataset.distintivo;
                if (propsGlobales) {
                    const mappedDistintivo = propMapping[distintivoActual];
                    edadMediaGlobal = propsGlobales[`edad_media_${mappedDistintivo}`];
                    edadMediaNacionalGlobal = propsGlobales[`em_nacional_${mappedDistintivo}`];

                    tooltipEdadMediaDefault(edadMediaGlobal, edadMediaNacionalGlobal, distintivoActual);
                }

                //document.getElementById('displayed-distintivo').textContent = `DISTINTIVO ${distintivoActual}`;
                actualizaLayersDistintivo(distintivoActual);
                //tooltipEdadMediaDefault(edadMediaGlobal, edadMediaNacionalGlobal, distintivoActual);
                actualizaLegenda(distintivoActual);
                if (datosVehiculos) {
                    const totalVehiculos = calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual);
                    document.getElementById('tooltip-tot_vehi').innerHTML = totalVehiculos + ' veh.';
                }
            });
        });

        /*document.querySelectorAll('#area-type-filters input[type=checkbox]').forEach((checkbox) => {
            checkbox.addEventListener('change', () => {
                actualizaFilter();
            });
        });*/

        function seleccionAreas() {
            return Array.from(document.querySelectorAll('.areas.active')).map(ele => ele.value);
        }

        var map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/datosrtve/clb6i4gin003n14nt3vu8daad",
            zoom: initialZoom,
            center: initialCenter,
            maxZoom: 11.9,
            maxBounds: bounds,
            cooperativeGestures: true,
            locale: {
                "ScrollZoomBlocker.CtrlMessage": "Usa ctrl + scroll para hacer zoom",
                "ScrollZoomBlocker.CmdMessage": "Use cmd + scroll para hacer zoom",
                "TouchPanBlocker.Message": "Usa dos dedos para moverte por el mapa"
            },
            transformRequest: transformRequest,
        });

        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            countries: 'es',
            language: 'es',
            types: 'place',
            placeholder: 'Busca tu municipio',
            // flyTo: { speed: 0.95 }
        });
    
        // map.addControl(geocoder);
        document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
        map.getCanvas().style.cursor = 'default';

        let hoveredStateId = null;
        let hoveredVehiculo = 'turismos';



        map.on('load', function () {
            var layers = map.getStyle().layers;
            for (let vehiculos in vehiculosConfig) {
                const config = vehiculosConfig[vehiculos];
                addSource(config.source, config.url, config.id);
                // Capas para todos los distintivos
                for (let distintivo of config.distint) {
                    addLayer(config.source, config.layer, distintivo);
                }
            }


   

            // Visibilidad inicial de las capas
            actualizaLayersDistintivo(distintivoActual);

            // Capa de resaltado una vez al inicio
            capaResaltado(vehiculosConfig[hoveredVehiculo].source, vehiculosConfig[hoveredVehiculo].layer);

            let selectVehiculo = document.getElementById('tipoVehiculo');
            let seleccionTipoVehiculo = 'todos';

            // Conectar manejadores de eventos
            for (let vehiculos in vehiculosConfig) {
                const config = vehiculosConfig[vehiculos];
                for (let distintivo of config.distint) {
                    map.on('mousemove', `layer-distintivo${distintivo}-${config.layer}`, function (e) {

                        controlMouseMove(e, vehiculos);
                    });

                    map.on('mouseleave', `layer-distintivo${distintivo}-${config.layer}`, function (e) {

                        document.getElementById('tooltip-municipio').innerHTML = 'ESPAÑA';
                        document.getElementById('tooltip-provincia').innerHTML = '\u00A0'; // Vaciamos la provincia porque no es necesaria
                        document.getElementById('tooltip-poblacion').innerHTML = formatPoblacionTotal + ' hab.'; //tooltip-tot-vehi
                        controlMouseLeave(e);
                        tooltipTabladefault(defaultTablaData, seleccionTipoVehiculo);
                        tooltipEdadMediaDefault(edadMediaGlobal, edadMediaNacionalGlobal, distintivoActual);

                        barPorcentajesDefault(colors);
         

                        const totalVehiculos = calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual);
     

                        if (datosVehiculos) {
                            const totalVehiculos = calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual);
                            document.getElementById('tooltip-tot_vehi').innerHTML = totalVehiculos.toLocaleString() + ' veh.';
                        }

                    });
                }
            }

            updateMap('todos');
        });

        function addSource(source, url) {
            if (!map.getSource(source)) {
                map.addSource(source, {
                    type: 'vector',
                    url: url,
                    promoteId: 'cod_ine'
                });
            }
        }

        function addLayer(source, layer, distintivoType) {
            if (!source) {
                console.error('source es indefinida o invalida:', source);
                return;
            }
            if (!layer) {
                console.error('layer es indefinida o invalida:', layer);
                return;
            }
            if (!distintivoType) {
                console.error('distintivoType es indefinida o invalida:', distintivoType);
                return;
            }

            const layerName = `layer-distintivo${distintivoType}-${layer}`;
      

            const porDistProperty = porDistMapping[distintivoType];
         

            const numDistProperty = numDistMapping[distintivoType];
       

            const colorScheme = colorSchemeMapping[distintivoType];
           

            layersDistintivo[distintivoType] = layersDistintivo[distintivoType] || [];
            layersDistintivo[distintivoType].push(layerName);
      

            let step1, step2, step3, step4, step5, step6, step7;
            if (['SIN', 'C'].includes(distintivoType)) {
                step1 = 5;
                step2 = 10;
                step3 = 20;
                step4 = 30;
                step5 = 40;
                step6 = 50;
                step7 = 60;
            } else if (['ECO', 'CERO'].includes(distintivoType)) {
                step1 = 1;
                step2 = 2;
                step3 = 4;
                step4 = 6;
                step5 = 8;
                step6 = 10;
                step7 = 12;
            } else if (['B'].includes(distintivoType)) {
                step1 = 1;
                step2 = 2;
                step3 = 5;
                step4 = 10;
                step5 = 20;
                step6 = 30;
                step7 = 40;
            } else {
                console.error('Tipo de distintivo no reconocido:', distintivoType);
                step1 = 5;
                step2 = 10;
                step3 = 20;
                step4 = 30;
                step5 = 40;
                step6 = 50;
                step7 = 60;
            }

            if (!colorScheme) {
                console.error(`Invalid distintivoType: ${distintivoType}`);
                return;
            }

            map.addLayer({
                'id': `layer-distintivo${distintivoType}-${layer}`,
                'type': 'fill',
                'source': source,
                'source-layer': layer,
                'filter': ['!=', ['get', numDistProperty], null],
                'layout': {},
                'paint': {
                    'fill-color': [
                        'case',
                        ['==', ['get', porDistProperty], 'N/A'], 'transparent', // o cualquier otro color para 'N/A'
                        ['interpolate', ['linear'], ['coalesce', ['get', porDistProperty], 0],
                            0, '#ffffff',
                            step1, colorScheme[0],
                            step2, colorScheme[1],
                            step3, colorScheme[2],
                            step4, colorScheme[3],
                            step5, colorScheme[4],
                            step6, colorScheme[5],
                            step7, colorScheme[6],
                        ]
                    ],
                    'fill-opacity': 1,
                    'fill-outline-color': '#e0e0e0'
                }
            });
        }


        function capaResaltado(source, layer) {
            map.addLayer({
                'id': `${layer}-outline`,
                'type': 'line',
                'source': source,
                'source-layer': layer,
                'layout': {},
                'paint': {
                    'line-color': '#000000',
                    'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 4, 0]
                }
            });
        }

        // PONEMOS DELANTE DE LOS POLÍGONOS VARIAS CAPAS DE ETIQUETAS DEL ESTILO DE MAPBOX
        map.on('idle', () => {
            if (map.getLayer('settlement-minor-label')) {
                map.moveLayer('settlement-minor-label');
            }
            if (map.getLayer('settlement-major-label')) {
                map.moveLayer('settlement-major-label');
            }
            if (map.getLayer('poi-label')) {
                map.moveLayer('poi-label');
            }
            if (map.getLayer('natural-point-label')) {
                map.moveLayer('natural-point-label');
            }
            if (map.getLayer('natural-line-label')) {
                map.moveLayer('natural-line-label');
            }
            if (map.getLayer('waterway-label')) {
                map.moveLayer('waterway-label');
            }
        });


        let seleccionTipoVehiculo = 'todos';
        console.log('propsGlobales justo antes de updateMap', propsGlobales);

        window.updateMap = function (tipoVehiculo) {
            console.log(`Actualizando mapa para: ${tipoVehiculo}`);
            console.log(`hoveredStateId antes de actualizar: ${hoveredStateId}`);

            seleccionTipoVehiculo = tipoVehiculo; // Actualización variable global
            console.log('seleccionTipoVehiculo en window.updateMap:', seleccionTipoVehiculo);

            const selectedData = datosVehiculos.find(data => data.tipo_vehiculo === seleccionTipoVehiculo);
            if (selectedData) {
                defaultTablaData = selectedData;
            } else {
                console.error('No se encontraron datos para el tipo de vehículo:', seleccionTipoVehiculo);
            }

            tooltipTabladefault(defaultTablaData, seleccionTipoVehiculo);
            //console.log(`Tipo de vehículo seleccionado: ${tipoVehiculo}`);

            // Llamada a la función `obtenerDatosVehiculo` con el tipo de vehículo seleccionado
            obtenerDatosVehiculo(tipoVehiculo, function (datos) {
                console.log('Datos recibidos:', datos); // Imprime los datos recibidos
                console.log('tipoVehiculo en obtenerDatosVehiculo (updatemap):', tipoVehiculo);

                propsGlobales = datos;
                console.log('propsGlobales:', propsGlobales); // Imprime propsGlobales después de asignarle los datos

                const mappedDistintivo = propMapping[distintivoActual];
                console.log('mappedDistintivo:', mappedDistintivo); // Imprime mappedDistintivo

                edadMediaGlobal = propsGlobales[`edad_media_${mappedDistintivo}`];
                console.log('edadMediaGlobal:', edadMediaGlobal); // Imprime edadMediaGlobal después de asignarle un valor

                edadMediaNacionalGlobal = propsGlobales[`em_nacional_${mappedDistintivo}`];
                console.log('edadMediaNacionalGlobal:', edadMediaNacionalGlobal); // Imprime edadMediaNacionalGlobal después de asignarle un valor

                console.log(`Datos actualizados para ${tipoVehiculo} + edad media nacional:`, datos);
                console.log('distintivoActual:', distintivoActual); // Imprime distintivoActual

                tooltipEdadMediaDefault(edadMediaGlobal, edadMediaNacionalGlobal, distintivoActual);
            });


            // Establece la visibilidad y las variables de resaltado según el tipo de vehículo
            for (let vehiculos in vehiculosConfig) {
                for (let distintivo of vehiculosConfig[vehiculos].distint) {
                    const layerName = `layer-distintivo${distintivo}-${vehiculosConfig[vehiculos].layer}`;
                    if (vehiculos === tipoVehiculo && distintivo === distintivoActual) {
                        visibilidadLayer(layerName, true);
                        hoveredSource = vehiculosConfig[vehiculos].source;
                        hoveredLayer = vehiculosConfig[vehiculos].layer;
                    } else {
                        visibilidadLayer(layerName, false);
                    }
                }
            }

            // Añade la capa de resaltado según el tipo de vehículo seleccionado
            if (map.getLayer(`${hoveredLayer}-outline`)) {
                map.removeLayer(`${hoveredLayer}-outline`);
            }
            capaResaltado(hoveredSource, hoveredLayer);

            if (datosVehiculos) {
                const totalVehiculos = calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual);
                document.getElementById('tooltip-tot_vehi').innerHTML = totalVehiculos + ' veh.';
            }

            console.log(`Capa visible actualizada: layer-distintivo-${hoveredLayer}`);
            console.log(`hoveredStateId después de actualizar: ${hoveredStateId}`);
        };



        function obtenerDatosVehiculo(tipoVehiculo, callback) {
            const configVehiculo = vehiculosConfig[tipoVehiculo];

            if (!configVehiculo) {
                console.error('Configuración del vehículo no encontrada para:', tipoVehiculo);
                return;
            }

            if (!map.getSource(configVehiculo.source)) {
                console.error('La fuente no existe:', configVehiculo.source);
                return;
            }

            map.once('idle', function () {
                const features = map.querySourceFeatures(configVehiculo.source, { sourceLayer: configVehiculo.layer });
                console.log('configVehiculo.source:', configVehiculo.source)
                console.log('configVehiculo.layer:', configVehiculo.layer)

                if (features.length > 0) {
                    callback(features[0].properties);
                } else {
                    console.error('No se encontraron features en la capa:', configVehiculo.layer);
                }
            });
        }



        function visibilidadLayer(layerId, visibility) {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', visibility ? 'visible' : 'none');
            } else {
                console.error(`Layer ${layerId} no existe en el mapa!`);
            }
        }

        function controlMouseMove(e) {
            if (!hoveredSource) {
                console.warn('hoveredSource no está definido');
                return;
            }


    
            if (e.features && e.features.length > 0 && e.features[0].source === hoveredSource) {
                const feature = e.features[0];
                const props = feature.properties;
   

                tooltipTabla(props);

                const colorMapping = {
                    'SIN': '#9c9c9c',
                    'B': '#ffee04',
                    'C': '#6db43f',
                    'ECO': '#1f7778',
                    'CERO': '#0077af',
                };

                if (props && tiposAreas.includes(props.tipo_area)) {
                    document.getElementById('default-message').classList.add('hidden');
                    const porcentajes = {
                        'SIN': props[`por_dist_SIN_DISTINTIVO`] || 0,
                        'B': props[`por_dist_DISTINTIVO_B`] || 0,
                        'C': props[`por_dist_DISTINTIVO_C`] || 0,
                        'ECO': props[`por_dist_ECO`] || 0,
                        'CERO': props[`por_dist_CERO`] || 0,
                    };

                    const numTotal = props['num_dist_TODOS'] || 0;

                    tooltipBarPorcentajes(porcentajes, colorMapping, numTotal);

                    let distintivo = distintivoActual;
       

                    const mappedDistintivo = propMapping[distintivo];

                    const edadMedia = props[`edad_media_${mappedDistintivo}`];
                    const edadMediaNacional = props[`em_nacional_${mappedDistintivo}`];
                    tooltipEdadMedia(edadMedia, edadMediaNacional, distintivo);

                    // Actualización de las variables globales
                    edadMediaGlobal = edadMedia;
                    edadMediaNacionalGlobal = edadMediaNacional;
                    propsGlobales = props;

      

                    let porDistProperty = `por_dist_${propMapping[distintivo]}`;


                    let numDistProperty = `num_dist_${propMapping[distintivo]}`;


                    let tasaDistProperty = `tasa_dist_${propMapping[distintivo]}`;
  

                    let edadMediaProperty = `edad_media_${propMapping[distintivo]}`;

                    document.getElementById('tooltip-municipio').innerHTML = props.nombre_clean || 'N/A';
                    document.getElementById('tooltip-provincia').innerHTML = `(${props.prov || 'N/A'})`;
                    document.getElementById('tooltip-poblacion').innerHTML = (props.pob ? Number(props.pob).toLocaleString('es-ES') + ' hab.' : 'N/A');
                    document.getElementById('tooltip-tot_vehi').innerHTML = props.tot_vehi.toLocaleString() || 'N/A';

                    //document.getElementById('tooltip-edad-media').innerHTML = props[edadMediaProperty] || 'N/A';

                    if (hoveredStateId !== null && hoveredStateId !== undefined) {
                        map.setFeatureState({ source: hoveredSource, sourceLayer: hoveredLayer, id: hoveredStateId }, { hover: false });
                    }

                    hoveredStateId = feature.id;
                    map.setFeatureState({ source: hoveredSource, sourceLayer: hoveredLayer, id: hoveredStateId }, { hover: true });
                } else {
                    clearTooltip(); // Limpia el tooltip si el tipo de área no está seleccionado
                }
            } else {
                clearTooltip(); // Limpia el tooltip si no hay características en el evento
            }
        }

        function controlMouseLeave() {

            if (hoveredStateId !== null) {
                map.setFeatureState({ source: hoveredSource, sourceLayer: hoveredLayer, id: hoveredStateId }, { hover: false });
                //hoveredStateId = null;
            }
            document.getElementById('default-message').classList.remove('hidden');
        }

        function clearTooltip() {
            document.getElementById('tooltip-municipio').innerHTML = '';
            document.getElementById('tooltip-tipo-area').innerHTML = '';
            document.getElementById('tooltip-porcentaje-dist').innerHTML = '';
            document.getElementById('tooltip-numero-dist').innerHTML = '';
            document.getElementById('tooltip-tasa-dist').innerHTML = '';
            document.getElementById('tooltip-poblacion').innerHTML = '';
            document.getElementById('tooltip-edad-media').innerHTML = '';
        }


        function calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual) {
            let sumaTotal;
            let claveDistintivo = '';

            if (distintivoActual === 'CERO' || distintivoActual === 'ECO') {
                claveDistintivo = `num_dist22_${distintivoActual}`;
            } else if (distintivoActual === 'SIN') {
                claveDistintivo = 'num_dist22_SIN DISTINTIVO';
            } else {
                claveDistintivo = `num_dist22_DISTINTIVO ${distintivoActual}`;
            }

            if (seleccionTipoVehiculo === 'todos') {
                // Buscar la entrada con tipo_vehiculo igual a 'todos'
                const entradaTotal = datosVehiculos.find(vehiculo => vehiculo.tipo_vehiculo === 'todos');
                if (entradaTotal) {
                    sumaTotal = parseInt(entradaTotal[claveDistintivo]);
                }
            } else {
                // Sumar valores para un tipo de vehículo específico
                datosVehiculos.forEach(vehiculo => {
                    if (vehiculo.tipo_vehiculo === seleccionTipoVehiculo) {
                        let cantidad = parseInt(vehiculo[claveDistintivo]);
                        sumaTotal += cantidad;
                    }
                });
            }

            return sumaTotal;
        }



        function tooltipEdadMedia(edadMedia, edadMediaNacional, distintivo) {
            const container = d3.select("#edad-media-bar");
            container.style("opacity", "1");
            const width = 300; // Define un ancho adecuado para la barra en píxeles
            const height = 20; // Altura de la barra
            const maxScaleValue = 50;

            const xScale = d3.scaleLinear()
                .domain([0, maxScaleValue])
                .range([0, width]);

            container.selectAll('*').remove(); // Limpia cualquier gráfico anterior

            // Dibuja la barra de escala transparente
            const scaleBar = container.append('div')
                .style('width', width + 'px')
                .style('height', height + 'px')
                .style('border', '1px solid #555555')
                .style('position', 'relative');

            // Añade las marcas y etiquetas de la escala
            [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(value => {
                scaleBar.append('div')
                    .style('width', '1px')
                    .style('height', '5px')
                    .style('background-color', '#555555')
                    .style('position', 'absolute')
                    .style('left', xScale(value) + 'px')
                    .style('bottom', '0px');

                scaleBar.append('div')
                    .text(value)
                    .style('position', 'absolute')
                    .style('left', xScale(value) - 5 + 'px')
                    .style('bottom', '-20px');
            });

            // Dibuja la barra de edad encima de la barra de escala
            const barWidth = xScale(edadMedia);
            scaleBar.append('div')
                .style('width', barWidth + 'px')
                .style('height', height + 'px')
                .style('background-color', colorDispositivo[distintivo])
                .style('position', 'absolute')
                .style('left', '0')
                .style('top', '0');

            // Coloca el valor de la edad media
            scaleBar.append('div')
                .text(edadMedia.toFixed(2)) // Dos decimales
                .style('position', 'absolute')
                .style('left', (barWidth < xScale(5) ? -40 : barWidth - 20) + 'px') // -40 es un valor ajustable
                .style('top', '5px')
                .style('font-weight', 'bold');

            // Dibuja la línea vertical para la edad media nacional
            scaleBar.append('div')
                .style('width', '2px')
                .style('height', (height + 10) + 'px') // Hace que sobresalga un poco
                .style('background-color', 'red')
                .style('position', 'absolute')
                .style('left', xScale(edadMediaNacional) + 'px')
                .style('top', '-5px'); // Hace que sobresalga un poco

            // Añade el valor de la edad media nacional al lado de la línea roja
            scaleBar.append('div')
                .text(edadMediaNacional.toFixed(2))
                .style('position', 'absolute')
                .style('left', xScale(edadMediaNacional) + 5 + 'px')
                .style('top', '-20px');
        }

        // Función para actualizar la barra de edad media con datos por defecto
        function tooltipEdadMediaDefault(edadMedia, edadMediaNacional, distintivo) {
            const container = d3.select("#edad-media-bar");
            container.style("opacity", "1");
            const width = 300; // Define un ancho adecuado para la barra en píxeles
            const height = 20; // Altura de la barra
            const maxScaleValue = 50;

            const xScale = d3.scaleLinear()
                .domain([0, maxScaleValue])
                .range([0, width]);

            container.selectAll('*').remove(); // Limpia cualquier gráfico anterior

            // Dibuja la barra de escala transparente
            const scaleBar = container.append('div')
                .style('width', width + 'px')
                .style('height', height + 'px')
                .style('border', '1px solid #555555')
                .style('position', 'relative');

            // Añade las marcas y etiquetas de la escala
            [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].forEach(value => {
                scaleBar.append('div')
                    .style('width', '1px')
                    .style('height', '5px')
                    .style('background-color', '#555555')
                    .style('position', 'absolute')
                    .style('left', xScale(value) + 'px')
                    .style('bottom', '0px');

                scaleBar.append('div')
                    .text(value)
                    .style('position', 'absolute')
                    .style('left', xScale(value) - 5 + 'px')
                    .style('bottom', '-20px');
            });

            // Dibuja la barra de edad encima de la barra de escala
            const barWidth = xScale(edadMediaNacional);
            scaleBar.append('div')
                .style('width', barWidth + 'px')
                .style('height', height + 'px')
                .style('background-color', colorDispositivo[distintivo])
                .style('position', 'absolute')
                .style('left', '0')
                .style('top', '0');

            // Coloca el valor de la edad media
            scaleBar.append('div')
                .text(edadMediaNacional ? edadMediaNacional.toFixed(2) : edadMediaNacional) // Dos decimales
                .style('position', 'absolute')
                .style('left', (barWidth < xScale(5) ? -40 : barWidth - 20) + 'px')
                .style('top', '5px')
                .style('font-weight', 'bold');

        }


        function tooltipBarPorcentajes(porcentajes, colors, numTotal) {
            const container = d3.select("#tooltip-bar-container");
            container.html(""); // Limpia el contenedor

            for (let distintivo in porcentajes) {
                const porcentaje = porcentajes[distintivo];
                const color = colors[distintivo];

                if (porcentaje > 0) {  // Solo añade un div si el porcentaje es mayor que cero
                    let barWidth = container.node().getBoundingClientRect().width * (porcentaje / 100);

                    let bar = container.append("div")
                        .style("background-color", color)
                        .style("width", `${porcentaje}%`)
                        .style("height", "100%")
                        .style("display", "inline-block")
                        .style("position", "relative")
                        .style("border-right", "1px solid #cdcdcd");

                    let text = `${porcentaje.toFixed(2)}%`;
                    let textSize = anchoTexto(text, "10px Arial");

                    if (textSize < barWidth) {
                        bar.append("span")
                            .text(text)
                            .attr("class", "bar-text")
                            .style("position", "absolute")
                            .style("top", "50%")
                            .style("left", "50%")
                            .style("transform", "translate(-50%, -50%)")
                            .style("color", "black");
                    }
                }
            }
        }


        // Barra de porcentajes con los datos por defecto
        function barPorcentajesDefault(colors) {
            if (!defaultTablaData) {
                console.error('defaultTablaData no está definido.');
                return;
            }

            const porcentajes = {
                'SIN': defaultTablaData['por_dist22_SIN DISTINTIVO'] || 0,
                'B': defaultTablaData['por_dist22_DISTINTIVO B'] || 0,
                'C': defaultTablaData['por_dist22_DISTINTIVO C'] || 0,
                'ECO': defaultTablaData['por_dist22_ECO'] || 0,
                'CERO': defaultTablaData['por_dist22_CERO'] || 0,
            };

            if (datosVehiculos) {
                const totalVehiculos = calcularTotalVehiculos(datosVehiculos, seleccionTipoVehiculo, distintivoActual);
                document.getElementById('tooltip-tot_vehi').innerHTML = totalVehiculos + ' veh.';
            }

            const container = d3.select("#tooltip-bar-container");
            container.html(""); // Limpia el contenedor

            for (let distintivo in porcentajes) {
                let porcentaje = parseFloat(porcentajes[distintivo]);
                const color = colors[distintivo];
                if (!isNaN(porcentaje) && porcentaje > 0) {
                    let barWidth = container.node().getBoundingClientRect().width * (porcentaje / 100);

                    let bar = container.append("div")
                        .style("background-color", color)
                        .style("width", `${porcentaje}%`)
                        .style("height", "100%")
                        .style("display", "inline-block")
                        .style("position", "relative")
                        .style("border-right", "1px solid #cdcdcd");

                    let text = `${porcentaje.toFixed(1)}%`;
                    let textSize = anchoTexto(text, "10px Arial");

                    if (textSize < barWidth) {
                        bar.append("span")
                            .text(text)
                            .attr("class", "bar-text")
                            .style("position", "absolute")
                            .style("top", "50%")
                            .style("left", "50%")
                            .style("transform", "translate(-50%, -50%)")
                            .style("color", "black");
                    }
                }
            }
        }

        //Obtener el ancho del texto
        function anchoTexto(text, font) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context.font = font;
            const metrics = context.measureText(text);
            return metrics.width;
        }


        function actualizaLayersDistintivo(distintivoActual) {
     
            for (let tipoVehiculo in vehiculosConfig) {
                const config = vehiculosConfig[tipoVehiculo];
                for (let distintivo of config.distint) {
                    const layerName = `layer-distintivo${distintivo}-${config.layer}`;
             
                    if (map.getLayer(layerName)) {
                        map.setLayoutProperty(layerName, 'visibility',
                            distintivo === distintivoActual && tipoVehiculo === seleccionTipoVehiculo ? 'visible' : 'none');
                    } else {
                        console.warn(`Layer ${layerName} no existe!`);
                    }
                }
            }

            const topLayer = `layer-distintivo${distintivoActual}-${vehiculosConfig[seleccionTipoVehiculo].layer}`;
            if (map.getLayer(topLayer)) {
                map.moveLayer(topLayer);
            }

            const resaltarCapa = `${vehiculosConfig[seleccionTipoVehiculo].layer}-outline`;
            if (map.getLayer(resaltarCapa)) {
                map.moveLayer(resaltarCapa);
            }

            // Resetear el estado de "hover" en la capa que estaba activa anteriormente
            if (hoveredStateId !== null && hoveredSource && hoveredLayer) {
                map.setFeatureState({ source: hoveredSource, sourceLayer: hoveredLayer, id: hoveredStateId }, { hover: false });
            }
            hoveredStateId = null;
        }

        function actualizaFilter() {
            const areasSeleccionadas = seleccionAreas();
            layerFilter(areasSeleccionadas);
        }

        function layerFilter(areasSeleccionadas) {
            let filter;
            if (areasSeleccionadas.length === 0) {
                filter = ['in', ['get', 'tipo_area'], 'non-existent-value'];
            } else {
                //filtro dinámico basado en las áreas seleccionadas.
                filter = ['match', ['get', 'tipo_area'], ...areasSeleccionadas.flatMap(area => [area, true]), false];
            }

            // Verificación de error
            if (!Array.isArray(filter) || filter.length < 2) {
                console.error('Error: filter no es un array válido!', filter);
                return;
            }

            // Filtro en todas las capas
            for (let tipoVehiculo in vehiculosConfig) {
                const config = vehiculosConfig[tipoVehiculo];
                for (let distintivo of config.distint) {
                    const layerName = `layer-distintivo${distintivo}-${config.layer}`;
                    if (map.getLayer(layerName)) {
                        map.setFilter(layerName, filter);
                    }
                }
            }
        }

        if (typeof actualizaLegenda === "function") {
            // Llamada segura a actualizaLegenda
            actualizaLegenda('C');
        } else {
            console.error("actualizaLegenda no está definido o no es una función");
        }

        function limitesEscala(distintivoType) {
            if (['SIN', 'C'].includes(distintivoType)) {
                return "5%, 10%, 20%, 30%, 40%, 50%, 60%";
            } else if (['ECO', 'CERO'].includes(distintivoType)) {
                return "1%, 2%, 4%, 6%, 8%, 10%, 12%";
            } else if (['B'].includes(distintivoType)) {
                return "1%, 2%, 5%, 10%, 20%, 30%, 40%";
            } else {
                console.error('Tipo de distintivo no reconocido:', distintivoType);
                return "5%, 10%, 20%, 30%, 40%, 50%, 60%";
            }
        }


        // Leyenda en d3.j
        function actualizaLegenda(distintivo) {
            const colorScheme = colorSchemeMapping[distintivo];
            const legendContainer = d3.select('#color-legend');

            // Limpiar el contenedor de la leyenda antes de añadir la nueva
            legendContainer.html('');

            // Calcula el ancho de cada item de la leyenda
            const itemWidth = 100 / colorScheme.length + '%';
            const scaleValues = limitesEscala(distintivo).split(", ");

            // Añadir cada color del esquema de colores al contenedor de la leyenda
            colorScheme.forEach((color, index) => {
                const legendItem = legendContainer.append('div')
                    .style('width', itemWidth)
                    .style('display', 'inline-block');

                // Añadir el color
                legendItem.append('div')
                    .style('background-color', color)
                    .style('width', '100%')
                    .style('height', '20px');

                // Añadir el valor del límite debajo del color
                legendItem.append('div')
                    .text(scaleValues[index])
                    .style('text-align', 'center')
                    .style('font-size', '10px');
            });

        }


        const distintivos = [
            { name: "SIN DISTINTIVO", abbr: "SIN" },
            { name: "DISTINTIVO B", abbr: "B" },
            { name: "DISTINTIVO C", abbr: "C" },
            { name: "ECO", abbr: "ECO" },
            { name: "CERO", abbr: "CERO" }
        ];


        //TABLA CON PRIMERA COLUMNA CON COLOR DEL DISTINTIVO

        function tooltipTabla(props) {
            // Seleccionar o crear la tabla en el tooltip
            let table = d3.select("#tooltip-table").selectAll("table").data([props]);
            table.exit().remove(); // Eliminar tablas no necesarias
            table = table.enter().append("table").merge(table);

            let thead = table.selectAll("thead").data([null]);
            thead = thead.enter().append("thead").merge(thead);

            const headers = ["Tipo", "Nº Veh.", "%", "Veh/1.000 hab."];
            let headerRow = thead.selectAll("tr").data([headers]);
            headerRow = headerRow.enter().append("tr").merge(headerRow);

            headerRow.selectAll("th")
                .data(d => d)
                .enter().append("th")
                .merge(headerRow.selectAll("th"))
                .text(d => d);

            // cuerpo de la tabla si no existe
            const distint = vehiculosConfig.todos.distint;
            let tbody = table.selectAll("tbody").data([distint]);
            tbody = tbody.enter().append("tbody").merge(tbody);

            // filas al cuerpo de la tabla
            let rows = tbody.selectAll("tr").data(distint);
            rows.exit().remove();
            rows = rows.enter().append("tr").merge(rows);

            // celdas a las filas
            rows.selectAll("td")
                .data(tipo => {
                    return [
                        { type: "text", value: tipo, color: colorDispositivo[tipo] }, // propiedad de color solo a la primera celda
                        { type: "number", value: Math.round(props[numDistMapping[tipo]]).toLocaleString('es-ES') },
                        { type: "percentage", value: parseFloat(props[porDistMapping[tipo]]).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
                        { type: "number", value: (props[numDistMapping[tipo]] / props['pob'] * 1000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }
                    ];
                })
                .enter().append("td")
                .merge(rows.selectAll("td"))
                .style("background-color", d => d.color || null)
                .text(d => d.value);
        }


        //TABLA CON VALORES POR DEFECTO (ESPAÑA)
        function tooltipTabladefault(props, tipo_vehiculo) {
            // Seleccionar o crear la tabla en el tooltip
            let table = d3.select("#tooltip-table").selectAll("table").data([props]);
            table.exit().remove(); // Eliminar tablas no necesarias
            table = table.enter().append("table").merge(table);

            // Agregar encabezado si no existe
            let thead = table.selectAll("thead").data([null]);
            thead = thead.enter().append("thead").merge(thead);

            const headers = ["Tipo", "Nº Veh.", "%", "Veh/100.000 hab."];
            let headerRow = thead.selectAll("tr").data([headers]);
            headerRow = headerRow.enter().append("tr").merge(headerRow);

            headerRow.selectAll("th")
                .data(d => d)
                .enter().append("th")
                .merge(headerRow.selectAll("th"))
                .text(d => d);


            let tbody = table.selectAll("tbody").data([distintivos]);
            tbody = tbody.enter().append("tbody").merge(tbody);

            //filas al cuerpo de la tabla
            let rows = tbody.selectAll("tr").data(d => d);
            rows.exit().remove();
            rows = rows.enter().append("tr").merge(rows);

            //celdas a las filas
            rows.selectAll("td")
                .data(distintivoObj => {
                    return [
                        { type: "text", value: distintivoObj.abbr, color: colorDispositivo[distintivoObj.abbr] },
                        { type: "number", value: Math.round(props[`num_dist22_${distintivoObj.name}`]).toLocaleString('es-ES') },
                        {
                            type: "percentage",
                            value: parseFloat(props[`por_dist22_${distintivoObj.name}`]).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                        },
                        {
                            type: "number",
                            value: (Number(props[`num_dist22_${distintivoObj.name}`]) / poblacionTotal * 100000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                        }
                    ];
                })
                .enter().append("td")
                .merge(rows.selectAll("td"))
                .style("background-color", (d) => {
                    return d => d.color || null
                })
                .text(d => d.value);
        }


        // BREADCRUMS
        // Obtener referencias a los elementos
        const distintivoRadio = document.querySelectorAll('.filter-buttons input[type="radio"]');
        const vehiculoTipoSelect = document.querySelector('#tipoVehiculo');
        const areaTipoCheckbox = document.querySelectorAll('#area-type-filters input[type="checkbox"]');
        const breadcrumb = document.querySelector('#breadcrumb');

        // Función para actualizar la "miga de pan"
        function updateBreadcrumb() {
            let distintivo = '';
            let tipoVehiculo = '';
            let tipoArea = [];

            // Obtener el distintivo seleccionado
            distintivoRadio.forEach(radio => {
                if (radio.checked) {
                    distintivo = radio.getAttribute('data-distintivo');
                }
            });

            // Obtener el tipo de vehículo seleccionado
            tipoVehiculo = vehiculoTipoSelect ? vehiculoTipoSelect.value : null;

            // Obtener los tipos de área seleccionados
            areaTipoCheckbox.forEach(checkbox => {
                if (checkbox.checked) {
                    tipoArea.push(checkbox.value);
                }
            });

            // Formatear la cadena para los tipos de área
            let areaTipoStr = '';
            if (tipoArea.length === 3) {
                areaTipoStr = 'todas las áreas';
            } else if (tipoArea.length === 2) {
                areaTipoStr = `${tipoArea[0]} + ${tipoArea[1]}`;
            } else if (tipoArea.length === 1) {
                areaTipoStr = tipoArea[0];
            } else {
                areaTipoStr = 'Ninguna área seleccionada';
            }

            // Actualizar la "miga de pan"
            breadcrumb.textContent = `${distintivo} > ${tipoVehiculo} > ${areaTipoStr}`;
            //breadcrumb.textContent = `Distintivo ${distintivo} / ${tipoVehiculo} /  ${areaTipoStr}`;

        }


        // Añadir eventos de escucha
        distintivoRadio.forEach(radio => radio.addEventListener('change', updateBreadcrumb));
        if(vehiculoTipoSelect)vehiculoTipoSelect.addEventListener('change', updateBreadcrumb);
        areaTipoCheckbox.forEach(checkbox => checkbox.addEventListener('change', updateBreadcrumb));

        // Actualizar la "miga de pan" inicialmente
        updateBreadcrumb();



        function transformRequest(url, resourceType) {
            var isMapboxRequest = url.slice(8, 22) === "api.mapbox.com" || url.slice(10, 26) === "tiles.mapbox.com";
            return {
                url: isMapboxRequest ? url.replace("?", "?pluginName=dataJoins&") : url,
            };
        }

        document.getElementById("edit").addEventListener('click',()=>{
            document.getElementById("menu").classList.toggle('active');
        })
    
        Array.from(document.getElementsByClassName("areas")).forEach((ele) => {
            ele.addEventListener("click", () => {
                ele.classList.toggle('active');
                actualizaFilter();
            });
        });
    });

    
});