// render a parkmap of all national parks

$(document).ready(function() {

    const public_access_token = 'pk.eyJ1IjoicXVhbmRhIiwiYSI6ImNqZTd2eTRrbjBpMXQycW16eTd0ODJncjEifQ.ZFdf44K2KF8UtZBsSac0wA'
    const terrainStyle = 'mapbox://styles/quanda/cje9hvv40b6sh2rmpzbloqwvx'
    const satelliteStyle = 'mapbox://styles/quanda/cje9ihwcj5xch2so2963460t0'
    const darkStyle = 'mapbox://styles/quanda/cjea3n8mi0ty02srwqufe3fcc'
    
    // initialize map
    mapboxgl.accessToken = public_access_token;
    let map = new mapboxgl.Map({
        container: 'map',
        style: satelliteStyle
    });
    console.log(map)

    map.on('load', function () {
        // Add zoom controls
        map.addControl(new mapboxgl.NavigationControl());

        // Geolocate user
        map.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));
        
       // Handle user leaving map
        $('.leaveMap').click(function() {
           window.location.href = '../index.html';
           $('.wrapper').children().hide();
           $('.landing-elem').show()
        })
        
        // handle user click on map
        map.on('click', function(e) {
            let features = map.queryRenderedFeatures(e.point, {
                layers: ['nps-parks-tileset'] // replace this with the name of the layer
            }); 
            
            let feature = features[0];
            if(!feature) {return}
            console.log(feature)
            //console.log(feature)
            let popup = new mapboxgl.Popup({ offset: [0, -15] })
                .setLngLat(feature.geometry.coordinates)
                .setHTML('<h3>' + feature.properties.title + '</h3>')
                .setLngLat(feature.geometry.coordinates)
                .addTo(map);
        });
    
   })

})

