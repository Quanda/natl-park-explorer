// render a parkmap of all national parks

$(document).ready(function() {

    const public_access_token = 'pk.eyJ1IjoicXVhbmRhIiwiYSI6ImNqZTd2eTRrbjBpMXQycW16eTd0ODJncjEifQ.ZFdf44K2KF8UtZBsSac0wA'
    const terrainStyle = 'mapbox://styles/quanda/cje9hvv40b6sh2rmpzbloqwvx'
    const satelliteStyle = 'mapbox://styles/quanda/cje9ihwcj5xch2so2963460t0'
    const darkStyle = 'mapbox://styles/quanda/cjea3n8mi0ty02srwqufe3fcc'
    const basicStyle = 'mapbox://styles/quanda/cjeat05qc2x2g2rpjh0np3gto'
    
    function leaveMap() {
        window.location.href = "index.html";
        $('.wrapper').children().hide();
        $('.landing-elem').show()
    }
    
    // CHECK if client has webGL installed
    if(!Detector.webgl) {
        $('.homeBtn').show().css('display', 'block');
        let errHtml = Detector.getWebGLErrorMessage();
        $('.homeBtn').after(errHtml);
        $('#webgl-error-message').css({
            'font-size': '35px',
            'margin-top': '2em'
        });
        
        $('.homeBtn').on('click', function() {
            leaveMap()
        })
    } else {
        
        // initialize map
        mapboxgl.accessToken = public_access_token;
        let map = new mapboxgl.Map({
            container: 'map',
            style: terrainStyle
        });
        console.log(map)

        map.on('load', function () {
            // show Go Back
            $('.leaveMap').css('display', 'inline-block');

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
               leaveMap();
            })

            // handle user click on map
            map.on('click', function(e) {
                let features = map.queryRenderedFeatures(e.point, {
                    layers: ['nps-parks-tileset'] // replace this with the name of the layer
                }); 

                if(!features.length) {return}

                let feature = features[0];
                console.log(feature)

                let popup = new mapboxgl.Popup({ offset: [0, -15] })
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(`<p class="parkPopup"> ${feature.properties.title} </p>`)
                    .setLngLat(feature.geometry.coordinates)
                    .addTo(map);
            });


            map.on('click', 'parkPopup', function() {
                // find matching park object 
                let matchingNationalPark = NPS_DATA.data.find( (park) => park.parkCode == feature["park code"])
                console.log(matchingNationalPark)
                // render the park view
                //renderParkView(matchingNationalPark)
            })


       })

   }
})

