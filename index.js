/*

*/
$(document).ready(function() {
    'use strict';
      
    // Google Maps API
    const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch';
    
    // National Parks Service API
    // https://www.nps.gov/subjects/developer/api-documentation.htm#/places/getPlaces
    const NPS_URL = 'https://developer.nps.gov/api/v1/parks';
    const NPS_API_KEY = 'lapmufG7NV0EN0DFxTZDvcVTVVfQQggLWURvaqdY'
    
    let matchingNationalParks, matchingNationalParkNames;

    // initialize the dropdown input
    let dropdownSelector = $('.park-search-input');
    dropdownSelector.empty(); // remove old options
    dropdownSelector.append($("<option></option>").text('Find a Park'));
    
    // load all national parks (for searchall)
    $.ajax( {
        url: NPS_URL,
        dataType: 'json', 
        data: {
            api_key: NPS_API_KEY,
            limit: 1000,
            sort: '!name'
        },
        success: function(nps_response) {
            console.log(nps_response)
            // filter response by national parks and where the name matches the user input (request.term)
            matchingNationalParks = nps_response.data.filter((item) => item.designation.match('Park'));
            
            // sort the national parks alphabetically
            matchingNationalParks.sort(function(a, b){
                if(a.fullName < b.fullName) return -1;
                if(a.fullName > b.fullName) return 1;
                return 0;
            })
                
            // add each national park as a select option
            $.each(matchingNationalParks, function(value, key) {
                dropdownSelector.append($("<option></option>").attr("value", value).text(key.fullName));
            });
        }
    })
    
    // handle user selecting search type
    $('.search-type-form input').change(function(event) {
        let searchType = $(event.target).val();
        console.log(searchType)
        let selectedSearchForm = $(`.${searchType}-search-form`)
        console.log(selectedSearchForm)

        $('.search-form').not(selectedSearchForm).hide();
        $(selectedSearchForm).show()
        
    });
    
    // handle user selecting park from searchall dropdown
    $('.park-search-input').change(function() {
        // the selected park from dropdown
        const selectedPark = $('.park-search-input').find(":selected").text();
        
        // find matching park object from api
        let matchingNationalPark = matchingNationalParks.find( (park) => park.fullName == selectedPark)
        
        // render the park view
        renderParkView(matchingNationalPark)
    })
    
    // handle search by keyword
    $('.keyword-search-form').on('submit', function(event){
        event.preventDefault();

        const SEARCH_STRING = $('.keyword-search-input').val();
       
        console.log(`Searching by keyword: ${SEARCH_STRING}`);

        getNPSData(NPS_URL, NPS_API_KEY, null, SEARCH_STRING, handleAPIResponse);
    })
    
    // handle search by state
    $('.state-search-input').change(function() {
        const STATE_CODE = $('.state-search-input').val();

        console.log(`Searching by state code: ${STATE_CODE}`);

        getNPSData(NPS_URL, NPS_API_KEY, STATE_CODE, null, handleAPIResponse);
    })
    
    // autocomplete national park search
    $('.keyword-search-input').autocomplete({
        source: function(request, response) {
            $.ajax( {
                url: NPS_URL,
                dataType: 'json', 
                data: {
                    q: request.term,
                    api_key: NPS_API_KEY,
                    limit: 1000,
                    sort: '!name'
                },
                success: function(nps_response) {
                    // filter response by national parks and where the name matches the user input (request.term)
                    matchingNationalParks = nps_response.data.filter((item) => item.designation.match('National Park') && item.name.match(new RegExp(request.term, 'i')))
                    
                    // list of national park names
                    matchingNationalParkNames = matchingNationalParks.map( (park) => park.name)
                    
                    response(matchingNationalParkNames);
                }
            })
        },
        minLength: 3,
        select: function( event, ui ) {
            // get data for matching park
            let matchingNationalPark = matchingNationalParks.find((park) => park.name == ui.item.value)
            console.log(matchingNationalPark)
            // render information for park
            renderParkView(matchingNationalPark)
            
        },
    } );

    // render the view for a single park
    function renderParkView(park) {
        $('.wrapper').children().not('.park-container').hide()
        let parkHtml = `<div class="park">
            <h2>${park.fullName}</h2>
            <p>${park.description}</p><br>
            <p>Location: ${park.states}</p><br>
            <a href="${park.url}" target="_blank">Website</a>
            <a href="${park.directionsUrl}" target="_blank">Directions</a><br><br>
            <p>ADD INSTAGRAM IMAGES BELOW using css grid</p>
         </div>`
        $('.park-container').html(parkHtml).show()
    }
    
    // return to home page
    function returnHome() {
        $('h1').on('click', function() {
            displayLandingPageElems()
        })
    }
    
    // render the landing page elements
    function displayLandingPageElems() {
        $('.wrapper').children().not('.landing-elem').hide()
        $('.wrapper').children('.landing-elem').show()
    }
    
    function handleAdvancedSearch() {
        $('.advanced-search').on('click', function() {
            $('.advanced-search-elem').toggle();
        })
    }

    // gets NPS data
    function getNPSData(url, API_KEY, STATE_CODE, SEARCH_STRING, callback) {
        const settings = {
            url: url,
            data: {
                q: SEARCH_STRING,
                stateCode: STATE_CODE,
                api_key: API_KEY,
                limit: 1000
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
        let nationalparks = response.data.filter((item) => item.designation.match('National Park'));
        console.log(nationalparks)
    }

    
     /*   
    // get current location
    function getCurrentLocation()
    {
        navigator.geolocation.getCurrentPosition(function(location) {
          console.log(location.coords.latitude);
          console.log(location.coords.longitude);
          console.log(location.coords.accuracy);
        });
    }  */
    
    returnHome()
    handleAdvancedSearch()
    displayLandingPageElems()
})