// updates nps_parks dataset

    
    const datasets_access_token = 'sk.eyJ1IjoicXVhbmRhIiwiYSI6ImNqZTlqcTk5ODExb3Myd21yb3psNTh3bG4ifQ.eObdl91yAxi4dr6vUmy5pg';
    const dataset_id = 'cje9czpy60abx33pnaay5u5ya'
    
    let client = new MapboxClient(datasets_access_token);
    
    // LOAD NPS DATA
    let NPS_DATA = {data: []};
    const NPS_URL = 'https://developer.nps.gov/api/v1/parks';
    const NPS_API_KEY = 'lapmufG7NV0EN0DFxTZDvcVTVVfQQggLWURvaqdY'
    const paginationSize = 50; 
    
   function fetchParks(startPoint = 0) {
        // MAKE AJAX CALL TO LOAD NATIONAL PARK DATA
        $.ajax( {
            url: NPS_URL,
            dataType: 'json', 
            data: {
                api_key: NPS_API_KEY,
                limit: paginationSize,
                start: startPoint,
                q: 'park',
                fields: 'addresses'
            },
            success: function(nps_response) {
                // build data array NPS_DATA.data by filtering response only by national parks
                const newParks = nps_response.data.filter((newPark) => newPark.designation.match('National Park'))
                NPS_DATA.data = NPS_DATA.data.concat(newParks);
                
                // handles request pagination
                // if no more data from api, finish 
                if(nps_response.data.length < paginationSize) {
                    console.log('finished getting nps data');
                    updateFeatures(NPS_DATA.data)
                } else { // continue querying api
                    fetchParks(paginationSize + startPoint);
                }
            }
        }) 
    } 
    
    $('.updateDataset').on('click', function() {
        console.log('running fetchParks');
        fetchParks();   
    })
    
    
    
    // update dataset...only run this once a day (script?)
    function updateFeatures(parks) {
        let features = [];
        console.log('running updateFeatures()');
        // loop through parks, create feature object, add to features array
        for(let i = 0; i < parks.length; i++) {
            const address = `${parks[i].addresses[0].line1}, ${parks[i].addresses[0].city}, ${parks[i].addresses[0].stateCode}`;
            const parkCode = parks[i].parkCode;
            const parkName = parks[i].name
            const lat = Number(parks[i].latLong.split(',')[0].replace('lat:', ""))
            const long = Number(parks[i].latLong.split(',')[1].replace('long:', ""))
                  
            // build the feature object
            let feature = {}
                feature.id = parkCode
                feature.type = "Feature"
                feature.properties = { 
                    "title": parkName,
                    "park code": parkCode
                }
                feature.geometry = {
                    "type": "Point",
                    "coordinates": [long, lat]
                }            
            // push feature to features array
            features.push(feature)
        }
        
        // loop through features array and send each feature to api
        features.forEach((feature) => {
            updateFeature(feature);
        }) 
    }
    
   // update a feature in dataset. if the id does not exist, it will create a new one
    function updateFeature(feature) {
        client.insertFeature(feature, dataset_id, function(err, feature) {
            console.log(feature)
        });
    }
