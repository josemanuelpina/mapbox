class mapbox{
    constructor(){
        this.mapbox = mapboxgl;
        this.mapbox.accessToken = 'pk.eyJ1IjoiZGF0b3NydHZlIiwiYSI6ImNsbWh3dzBnbzJxaW4zZG81dnRlMHpqdm4ifQ.i3SdiqKN_-sBlD3JNABQJg';
        this.initialZoom;
        this.initialCenter;
        this.bounds;
        this.isMapboxRequest;


        this.startConfigurationMapBoxParameters();
        this.buildMapBox();
        this.buildGeoCoder();
    }
    startConfigurationMapBoxParameters(){
        this.initialZoom = this.isMobile() ? 5 : 5.8;
        this.initialCenter = this.isMobile() ? [-3.3292966493690983, 40.06720017596038] : [-4.02502, 39.95027];
        this.bounds = [
            [-104.1059556369808, -7.481376773454173],
            [106.83154436302016, 68.58881756396005]
        ];
    }

    buildMapBox(){
        this.map = new this.mapbox.Map({
            container: "map",
            style: "mapbox://styles/datosrtve/clb6i4gin003n14nt3vu8daad",
            zoom: this.initialZoom,
            center: this.initialCenter,
            maxZoom: 11.9,
            maxBounds: this.bounds,
            cooperativeGestures: true,
            locale: {
                "ScrollZoomBlocker.CtrlMessage": "Usa ctrl + scroll para hacer zoom",
                "ScrollZoomBlocker.CmdMessage": "Use cmd + scroll para hacer zoom",
                "TouchPanBlocker.Message": "Usa dos dedos para moverte por el mapa"
            },
            transformRequest: this.transformRequest,
        });
    }

    buildGeoCoder(){
        this.geocoder = new MapboxGeocoder({
            accessToken: this.mapbox.accessToken,
            mapboxgl: this.mapbox,
            marker: false,
            placeholder: 'Introduce una ubicación',
        });
    
        // Añade el control de geocodificación al mapa
        this.map.addControl(this.geocoder);
    
        this.geocoder.on('result', (e) => {
            this.geocoder.clear();
        });
    
        this.map.getCanvas().style.cursor = 'default';
    }
    

    transformRequest(url, resourceType) {
        this.isMapboxRequest = url.slice(8, 22) === "api.mapbox.com" || url.slice(10, 26) === "tiles.mapbox.com";
        return {
            url: this.isMapboxRequest ? url.replace("?", "?pluginName=dataJoins&") : url,
        };
    }

    isMobile(){
        return Detectizr.device.type == 'mobile' ? true : false;
    }
}