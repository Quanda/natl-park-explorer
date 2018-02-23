$(document).ready(function() {
    
    'use strict';
    
    // Google Maps API
    const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch';
    
    // National Parks Service API
    // https://www.nps.gov/subjects/developer/api-documentation.htm#/places/getPlaces
    const NPS_URL = 'https://developer.nps.gov/api/v1/parks';
    const NPS_API_KEY = 'lapmufG7NV0EN0DFxTZDvcVTVVfQQggLWURvaqdY'

    // search by keyword
    $('.keyword-search-submit').on('click', function(){
        
        const SEARCH_STRING = $('.keyword-search-input').val();
       
        console.log(`Searching by keyword: ${SEARCH_STRING}`);

        getAPIData(NPS_URL, NPS_API_KEY, null, SEARCH_STRING, handleAPIResponse);
    })
    
    // search by state code
    $('.state-search-submit').on('click', function(){

        const STATE_CODE = $('.state-search-input').val();

        console.log(`Searching by state code: ${STATE_CODE}`);

        getAPIData(NPS_URL, NPS_API_KEY, STATE_CODE, null, handleAPIResponse);
    })

    // search by keyword
    $('.aroundme-search-submit').on('click', function(){
               
        
        getAPIData(NPS_URL, NPS_API_KEY, null, SEARCH_STRING, handleAPIResponse);
    })  

    
    // gets api data
    function getAPIData(url, API_KEY, STATE_CODE, SEARCH_STRING, callback) {
        const settings = {
            url: url,
            data: {
                q: SEARCH_STRING,
                stateCode: STATE_CODE,
                api_key: API_KEY
            },
            dataType: 'json',
            type: 'GET',
            success: callback
        };

      $.ajax(settings);
    }

    // API callback function
    function handleAPIResponse(response) {        
        console.log('Handling API response...');       
        console.log(response);       
    }
    

    /* get current location
    function getCurrentLocation()
    {
        navigator.geolocation.getCurrentPosition(function(location) {
          console.log(location.coords.latitude);
          console.log(location.coords.longitude);
          console.log(location.coords.accuracy);
        });
    }  */
    
})