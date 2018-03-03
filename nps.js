/*
    compartmentalize JS into appropriate files
*/

$(document).ready(function() {
    'use strict';
    
    // Google Maps API
    const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch';
    
    // National Parks Service API (https://www.nps.gov/subjects/developer/api-documentation.htm#/places/getPlaces)
    const NPS_URL = 'https://developer.nps.gov/api/v1/parks';
    const NPS_API_KEY = 'lapmufG7NV0EN0DFxTZDvcVTVVfQQggLWURvaqdY'
    
    // used in fetchParks() 
    const paginationSize = 50;

    // invoke functions
    displayLandingElemsOnly(); // initially render only home page elements
    returnHome() // removes wrapper child elements when home button (h1) clicked
    parkBackout(); // handles click of 'Back' button in Park view
    handleAccordionToggle(); 
    fetchParks();
    
    // initialize variables
    let NPS_DATA = {data: []}, matchingNationalParks, matchingNationalParkNames;
    
    // prepare the dropdown input
    let parkSearchSelector = $('.park-search-input');
    parkSearchSelector.empty(); // remove old options
    parkSearchSelector.append($("<option></option>").text('Find a Park').val(-1));
    
    function fetchParks(startPoint = 0) {
        // MAKE AJAX CALL TO LOAD NATIONAL PARK DATA
        // INITIALIZE THE KEYWORD SEARCH AUTOCOMPLETE WITH THIS DATA
        
        $.ajax( {
            url: NPS_URL,
            dataType: 'json', 
            data: {
                api_key: NPS_API_KEY,
                limit: paginationSize,
                start: startPoint,
                q: 'park',
                fields: 'images'
            },
            success: function(nps_response) {
                // build data array NPS_DATA.data by filtering response only by national parks
                const newParks = nps_response.data.filter((newPark) => newPark.designation.match('National Park'))
                NPS_DATA.data = NPS_DATA.data.concat(newParks);

                // add each national park as a select option
                $.each(NPS_DATA.data, function(value, key) {
                    let textHtml = `<option value="${key.parkCode}">${key.fullName}</option>`
                    parkSearchSelector.append(textHtml);    
                });
                
                // handles request pagination
                // if no more data from api, finish 
                if(nps_response.data.length < paginationSize) {
                    console.log(NPS_DATA.data);
                } else { // continue querying api
                    fetchParks(paginationSize + startPoint);
                }
            }
        })
    }


    /*
    function sortNationalParkNames() {
        // sort the national parks alphabetically
        return matchingNationalParks.sort(function(a, b){
            if(a.fullName < b.fullName) return -1;
            if(a.fullName > b.fullName) return 1;
            return 0;
        }) 
    } */

/* SEARCH FUNCTIONS */
    // User clicks Interactive Map
    $('.map-btn-container').on('click', function() {
        window.location.href = 'parkmap.html';
    })
    
    // User clicks on find-a-park-link or explore-btn-container
    // Reset the search
    $('.find-a-park-link, .explore-btn-container').on('click', function() {
        resetParkSearch('park')
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
        let selectedParkCode = $('.park-search-input').find(":selected").val();
        
        // find matching park object from api
        let matchingNationalPark = NPS_DATA.data.find( (park) => park.parkCode == selectedParkCode)

        // render the park view
        renderParkView(matchingNationalPark)
    });
    
    // handle search by state
    $('.state-search-input').change(function() {
        const STATE_CODE = $('.state-search-input').val();
        
        // get the parks in the selected state
        let parksInState = NPS_DATA.data.filter( (park) => park.states.match(STATE_CODE) );
        
        // render the view
        handleMultiparkSearch(parksInState);
    });
    
    // FIX THIS TO WORK WITH NPS_DATA
    // handle search by keyword
    $('.keyword-search-form').on('submit', function(event){
        event.preventDefault();

        const SEARCH_STRING = $('.keyword-search-input').val();
       
        let matchedParks = [];
        NPS_DATA.data.forEach( (park) => {
            Object.keys(park).some( function(key) {
                if(park[key].match(SEARCH_STRING)) {
                    matchedParks.push(park);
                    return true;
                }
            })
        })
        // render the view
        handleMultiparkSearch(matchedParks);
    });
    
    // returns array of national park names
    function returnNationalParkNames(parks) {
        // list of national park names
        return NPS_DATA.data.map( (park) => park.fullName)
    };
    
    // render the view for a single park
    function renderParkView(park) {
        let imageResults = ``
        park.images.forEach( (img) => {
            imageResults += `<div class="result"><a href="${img.url}" data-fancybox><img src="${img.url}" alt="${img.altText}"/></a></div>`
        })
        let parkHtml = `<div class="park">
            <a class="park-backout" href="#">Back</a>
            <h2>${park.fullName}</h2>
            <p>${park.description}</p><br>
            <p>Location: <a href="https://www.google.com/maps/place/${park.fullName}" target="_blank">${park.states}</a></p><br>
            <a href="${park.directionsUrl}" target="_blank">Directions</a>
            <a href="https://www.nps.gov/${park.parkCode}/planyourvisit/index.htm" target="_blank">Plan your Visit</a><br><br>
            <div class="grid">
                ${imageResults}
            </div>
         </div>`
        $('.park-container').find('.park').remove();
        $('.park-list-accordion').hide().children().remove();
        $('.park-container').prepend(parkHtml).show();
    }

    // render the view for potentially multiple parks
    function renderParksAccordion(nationalparks) {    
        // loop through national parks and append each to park-list-accordion
        nationalparks.forEach( (park) => {
            let imageResults = ``
            park.images.forEach( (img) => {
                imageResults += `<div class="result"><a href="${img.url}" data-fancybox><img src="${img.url}" alt="${img.altText}"/></a></div>`
            })
            let parkListItem = `
                <li>
                    <a class="toggle" href="javascript:void(0);">${park.fullName}</a>
                    <div class="park inner">
                        <a class="park-backout" href="#">Back</a>
                        <h2>${park.fullName}</h2>
                        <p>${park.description}</p><br>
                        <p>Location: <a href="https://www.google.com/maps/place/${park.fullName}" target="_blank">${park.states}</a></p><br>
                        <a href="${park.directionsUrl}" target="_blank">Directions</a>
                        <a href="https://www.nps.gov/${park.parkCode}/planyourvisit/index.htm" target="_blank">Plan your Visit</a><br><br>
                        <div class="grid">
                            ${imageResults}
                        </div>
                    </div>
                </li>`
            $('.park-list-accordion').append(parkListItem);
        })
        $('.park.inner').removeClass('show').slideUp(350);
        $('.park-container').show();
        $('.park-list-accordion').show();
    }
   
    // render the landing page elements
    function displayLandingElemsOnly() {
        $('.wrapper').children().hide();
        $('.landing-elem').show()
    }
    
    // return to home page
    function returnHome() {
        $('h1').on('click', function() {
            displayLandingElemsOnly()
        })
    }
    
    // listens for user to click Back button in park view
    function parkBackout() {
        $('.park-container').on('click', '.park-backout', function() {
            let searchType = $("input[name='rb']:checked").val()
            resetParkSearch(searchType);
        })
    }
    
    // hides wrapper child elements and shows the park-search-form and search-type-form
    function resetParkSearch(searchtype) {
        $('.wrapper').children().hide(); // hide wrapper children
        $(`.${searchtype}-search-form, .search-type-form`).show(); //show the selected search type input
        parkSearchSelector.val(-1); // reset selected park in park search input
        $('.keyword-search-input').val(''); // clear the keyword search input value
        $(`.search-type-form input`).prop( "checked", false ); // make all search type buttons unchecked
        $(`.search-type-form input[value=${searchtype}]`).prop( "checked", true ); // make the selected search type checked
    }

    // runs after user submits a keyword or selects a state
    // either renders one park, multiple (accordion), or none
    function handleMultiparkSearch(parks) {        
        // clear the sub child elements in park-container and show it
        $('.park-container').children().children().remove();
        
        // display parks in accordion
        if (parks.length === 1) {
            renderParkView(parks[0])
        } else if (parks.length > 1) {
            renderParksAccordion(parks)
        } else {
            noResultsFound();
        }
    }
    
    function noResultsFound() {
        // empty the children of park-container
        $('.park-container').show().children().html('');
        // add and show the no-results element
        $('.no-results').show().html(`<p>No results found</p>`).effect( "shake" );
    }
    
    function handleAccordionToggle() {
        $('.park-list-accordion').on('click', '.toggle', function(event) {
            console.log('clicked toggle');
            event.preventDefault();
                       
            let $this = $(this);
            if ($this.next().hasClass('show')) {
                $this.next().removeClass('show');
                $this.next().slideUp(350);
            } else {
                $this.parent().parent().find('li .inner').removeClass('show');
                $this.parent().parent().find('li .inner').slideUp(350);
                $this.next().toggleClass('show');
                $this.next().slideToggle(350);
            }  
        })
    }
        
})