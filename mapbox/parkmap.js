// render a parkmap of all national parks

$(document).ready(function() {

    const public_access_token = 'pk.eyJ1IjoicXVhbmRhIiwiYSI6ImNqZTd2eTRrbjBpMXQycW16eTd0ODJncjEifQ.ZFdf44K2KF8UtZBsSac0wA'

    
    // initialize map
    mapboxgl.accessToken = public_access_token;
        let map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/quanda/cje7wuimv088a2to67htoope9'
        });
    


    // handle user click on map
    map.on('click', function(e) {
        let features = map.queryRenderedFeatures(e.point, {
            layers: ['test'] // replace this with the name of the layer
        });

        if (!features.length) {
            return;
        }

        let feature = features[0];
        //console.log(feature)
        let popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<h3>' + feature.properties.title + '</h3>')
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
    });

})

