document.addEventListener("DOMContentLoaded", function() {
    const listaPuntos = document.getElementById('points-list');
    const detallePlaya = document.getElementById('playa-detalle');
    const detallePlayaContent = document.getElementById('playa-detalle-content');
    const closeDetallePlaya = document.getElementById('close-playa-detalle');
    // const buttonVolver = document.getElementById('button-volver');

    listaPuntos.addEventListener('click', function(e) {
        const target = e.target.closest('li.list-item');
        if (target) {
            const pointId = target.getAttribute('data-id');
            const datosPlaya = geojson.features.find(feature => feature.properties.OBJECTID == pointId);
            if (datosPlaya) {
                document.body.style.overflow = 'hidden'
                mostrarDetallePlaya(datosPlaya);
            }
        }
    });

    closeDetallePlaya.addEventListener('click', function() {
        detallePlaya.classList.remove('visible');
        document.body.style.overflow = 'auto'
    });

    // buttonVolver.addEventListener('click', function() {
    //     detallePlaya.classList.remove('visible');
    // });

    window.mostrarDetallePlaya = function(datosPlaya) {
        const properties = datosPlaya.properties;

        let fotoHtml = '';
        if (properties.foto) {
            fotoHtml = `<img src="${properties.foto}" alt="${properties.nombre_completo}" style="width: 100%; height: auto;">`;
        }

        function ordenarElementos(elementos) {
            const disponibles = elementos.filter(e => e.valor).sort((a, b) => a.nombre.localeCompare(b.nombre));
            const noDisponibles = elementos.filter(e => !e.valor).sort((a, b) => a.nombre.localeCompare(b.nombre));
            return [...disponibles, ...noDisponibles];
        }

        // Servicios
        const servicios = [
            { nombre: 'Accesible en silla de ruedas', valor: properties.accesible_sillas_ruedas },
            { nombre: 'Aseos', valor: properties.aseos },
            { nombre: 'Alquiler de sombrillas/hamacas', valor: properties.alquiler_sombrillas_hamacas },
            { nombre: 'Aparcamiento', valor: properties.aparcamiento },
            { nombre: 'Chiringuito', valor: properties.chiringuito },
            { nombre: 'Duchas y/o Lavapiés', valor: properties.duchas_lavapies },
            { nombre: 'Socorrista', valor: properties.socorrista },
            { nombre: 'Zona infantil', valor: properties.zona_infantil }
        ];
        const serviciosHtml = ordenarElementos(servicios).map(servicio => {
            return `<p class="${servicio.valor ? '' : 'atenuado'}"><strong>${servicio.nombre}:</strong> ${servicio.valor ? 'Sí' : 'No'}</p>`;
        }).join('');

        // Características
        const caracteristicas = [
            { nombre: 'Oleaje', valor: properties.oleaje },
            { nombre: 'Bandera Azul', valor: properties.banderas_azules },
            { nombre: 'Nudismo', valor: properties.nudismo }
        ];
        const caracteristicasHtml = ordenarElementos(caracteristicas).map(caracteristica => {
            return `<p class="${caracteristica.valor ? '' : 'atenuado'}"><strong>${caracteristica.nombre}:</strong> ${caracteristica.valor ? 'Moderado' : 'No'}</p>`;
        }).join('');

        // Entorno
        const entorno = [
            { nombre: 'Entorno', valor: properties.entorno },
            { nombre: 'Urbanización', valor: properties.urbanizacion },
            { nombre: 'Entorno protegido', valor: properties.entorno_protegido },
            { nombre: 'Paseo completo', valor: properties.paseo_completo }
        ];
        const entornoHtml = ordenarElementos(entorno).map(entorno => {
            return `<p class="${entorno.valor ? '' : 'atenuado'}"><strong>${entorno.nombre}:</strong> ${entorno.valor ? 'Sí' : 'No'}</p>`;
        }).join('');

        // Actividades
        const actividades = [
            { nombre: 'Alquiler náutico', valor: properties.alquiler_nautico },
            { nombre: 'Club náutico', valor: properties.club_nautico },
            { nombre: 'Fondo para barcos', valor: properties.fondo_barcos },
            { nombre: 'Submarinismo', valor: properties.submarinismo },
            { nombre: 'Surf', valor: properties.surf },
            { nombre: 'Zona deportiva', valor: properties.zona_deportiva }
        ];
        const actividadesHtml = ordenarElementos(actividades).map(actividad => {
            return `<p class="${actividad.valor ? '' : 'atenuado'}"><strong>${actividad.nombre}:</strong> ${actividad.valor ? 'Sí' : 'No'}</p>`;
        }).join('');
    
        detallePlayaContent.innerHTML = `
        <div class="in__main_datails">
            <h1>${properties.nombre_completo}</h1>
            ${fotoHtml}
            <p><strong>Comunidad:</strong> ${properties.comunidad}</p>
            <p><strong>Provincia/Isla:</strong> ${properties.provincia_isla}</p>
            <p><strong>Municipio:</strong> ${properties.municipio}</p>
            <p><strong>Equipamiento:</strong> ${properties.equipamiento}</p>
            <p><strong>Ocupación:</strong> ${properties.ocupacion}</p>

            <h3>Servicios</h3>
            ${serviciosHtml}

            <h3>Características</h3>
            ${caracteristicasHtml}

            <h3>Entorno</h3>
            ${entornoHtml}

            <h3>Actividades</h3>
            ${actividadesHtml}

            <h3>Accesibilidad y Servicios</h3>
            <p><strong>Hospital más cercano:</strong> ${properties.hospital} (${properties.distancia_hospital} km)</p>
            <p><strong>Carretera:</strong> ${properties.carretera}</p>
            <p><strong>Formas de acceso:</strong> ${properties.formas_acceso}</p>
            <p><strong>Transporte público:</strong> ${properties.transporte_publico}</p>
            <p><strong>Advertencia de acceso:</strong> ${properties.advertencia_acceso}</p>
        </div>`;
    
        detallePlaya.classList.add('visible');
        document.querySelector("#playa-detalle-content").scrollTo(0,0)
    };
});    
