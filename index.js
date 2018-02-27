/*
    compartmentalize JS into appropriate files
*/

$(document).ready(function() {
    'use strict';
    
    // invoke functions
    returnHome() // removes wrapper child elements when home button (h1) clicked
    displayLandingElemsOnly(); // hides all elements except landing elements
    parkBackout(); // handles click of 'Back' button in Park view
    
    // Google Maps API
    const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch';
    
    // National Parks Service API (https://www.nps.gov/subjects/developer/api-documentation.htm#/places/getPlaces)
    const NPS_URL = 'https://developer.nps.gov/api/v1/parks';
    const NPS_API_KEY = 'lapmufG7NV0EN0DFxTZDvcVTVVfQQggLWURvaqdY'
    
    // initialize variables
    let NPS_DATA, matchingNationalParks, matchingNationalParkNames;

    // prepare the dropdown input
    let parkSearchSelector = $('.park-search-input');
    parkSearchSelector.empty(); // remove old options
    parkSearchSelector.append($("<option></option>").text('Find a Park').val(-1));
    
    // MAKE AJAX CALL TO LOAD NATIONAL PARK DATA
    // INITIALIZE THE KEYWORD SEARCH AUTOCOMPLETE WITH THIS DATA
    $.ajax( {
        url: NPS_URL,
        dataType: 'json', 
        data: {
            api_key: NPS_API_KEY,
            limit: 1000
        },
        success: function(nps_response) {
            NPS_DATA = nps_response;
            console.log('nps_data...')
            console.log(NPS_DATA)
            // filter response by national parks and where the name matches the user input (request.term)
            matchingNationalParks = NPS_DATA.data.filter((item) => item.designation.match('Park'));
            
            // sort the national parks alphabetically
            matchingNationalParks.sort(function(a, b){
                if(a.fullName < b.fullName) return -1;
                if(a.fullName > b.fullName) return 1;
                return 0;
            })
                
            // add each national park as a select option
            $.each(matchingNationalParks, function(value, key) {
                let textHtml = `<option value="${value}">${key.fullName}</option>`
                parkSearchSelector.append(textHtml);
                //parkSearchSelector.append($("<option></option>").attr("value", value).text(key.fullName));
            });
            
            handleKeywordAutoComplete(); 
        }
    })

/* NATIONAL PARK SERVICE SEARCH */
    /* NAVIGATION LINKS */
    
    // find a park and homepage explore buttons
    $('.find-a-park-link, .explore-btn-container').on('click', function() {
        resetParkSearch('park')
    })
    // gallery
    $('.gallery-link').on('click', function() {
        console.log('clicked gallery link');
    })
    
    // handle user selecting search type
    $('.search-type-form input').change(function(event) {
        let searchType = $(event.target).val();
        let selectedSearchForm = $(`.${searchType}-search-form`);
        
        // uncheck radios then check only the one that was selected
        $(`.search-type-form input`).prop( "checked", false );
        $(`.search-type-form input[value=${searchType}]`).prop( "checked", true );

        $('.search-form').not(selectedSearchForm).hide();
        $(selectedSearchForm).show()   
    });
    
    // handle user selecting park from find a park dropdown
    $('.park-search-input').change(function() {
        // the selected park from dropdown
        let selectedPark = $('.park-search-input').find(":selected").text();
        
        // find matching park object from api
        let matchingNationalPark = matchingNationalParks.find( (park) => park.fullName == selectedPark)

        // render the park view
        renderParkView(matchingNationalPark)
    });
    
    // handle search by keyword
    $('.keyword-search-form').on('submit', function(event){
        event.preventDefault();

        const SEARCH_STRING = $('.keyword-search-input').val();
       
        console.log(`Searching by keyword: ${SEARCH_STRING}`);

        getNPSData(NPS_URL, NPS_API_KEY, null, SEARCH_STRING, handleAPIResponse);
    });
    
    // handle search by state
    $('.state-search-input').change(function() {
        const STATE_CODE = $('.state-search-input').val();

        console.log(`Searching by state code: ${STATE_CODE}`);

        getNPSData(NPS_URL, NPS_API_KEY, STATE_CODE, null, handleAPIResponse);
    });
    
    // returns array of national park names
    function returnNationalParkNames(parks) {
        // list of national park names
        console.log(parks)
        return parks.map( (park) => park.fullName)
    };
    
    // autocomplete the keyword search input
    function handleKeywordAutoComplete() {
        $('.keyword-search-input').autocomplete({
            source: returnNationalParkNames(matchingNationalParks),
            minLength: 3,
            select: function( event, ui ) {
                // get data for matching park
                let matchingNationalPark = matchingNationalParks.find((park) => park.fullName == ui.item.value)
                
                // render information for park
                renderParkView(matchingNationalPark)
            }
        })
    }
    
    // render the view for a single park
    function renderParkView(park) {
        $('.wrapper').children().not('.park-container').hide()
        let parkHtml = `<div class="park">
            <a class="park-backout" href="#">Back</a>
            <h2>${park.fullName}</h2>
            <p>${park.description}</p><br>
            <p>Location: <a href="https://www.google.com/maps/place/${park.fullName}" target="_blank">${park.states}</a></p><br>
            <a href="${park.directionsUrl}" target="_blank">Directions</a>
            <a href="https://www.nps.gov/${park.parkCode}/planyourvisit/index.htm" target="_blank">Plan your Visit</a><br><br>
            <p>ADD INSTAGRAM IMAGES BELOW using css grid</p>
         </div>`
        $('.park-container').html(parkHtml).show()
    }
    
    // return to home page
    function returnHome() {
        $('h1').on('click', function() {
            displayLandingElemsOnly()
        })
    }
    
    // render the landing page elements
    function displayLandingElemsOnly() {
        $('.wrapper').children().hide();
        $('.landing-elem').show()
    }
    
    function parkBackout() {
        $('.park-container').on('click', '.park-backout', function() {
            let searchType = $("input[name='rb']:checked").val()
            resetParkSearch(searchType);
        })
    }
    
    // hides wrapper child elements and shows the park-search-form and search-type-form
    function resetParkSearch(searchtype) {
        $('.wrapper').children().hide();
        $(`.${searchtype}-search-form, .search-type-form`).show();
        parkSearchSelector.val(-1); 
        $('.keyword-search-input').val('');
        $(`.search-type-form input`).prop( "checked", false );
        $(`.search-type-form input[value=${searchtype}]`).prop( "checked", true );
    }
    
    // general call to get NPS data
    // STATE_CODE and SEARCH_STRING are optional
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

    
})