const TractPropertyList = ['bus commuters', 'median income', 'poverty income'];
var currentTractProperty = 'poverty income';

/* Set up the initial map center and zoom level */
var map = L.map(
    'map', {
        center: [42.343571, -83.062131], // re-center map
        zoom: 14,  // from 1 (zoomed out) to 18 (zoomed in)
        scrollWheelZoom: true,
        fullscreenControl: true,
        searchControl: false,
        minimapControl: false,
        editInOSMControl: false,
        layersControl: false,
        locateControl: false,
    }
);

/* display basemap tiles -- see others at https://leaflet-extras.github.io/leaflet-providers/preview/ */
L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
).addTo(map);

/* Display a point marker with pop-up text */
L.marker([42.343571, -83.062131]).addTo(map).bindPopup("Insert pop-up text here"); 

const onEachTract = (feature, layer) => {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.GEOID) {
        layer.bindPopup(feature.properties.GEOID);
    }
}

fetch("data/detroit_tract_poly.geojson").then(res => res.json()).then(
    data => {
        // add GeoJSON layer to the map once the file is loaded
        const censusTractLayer = L.geoJSON(data, {style:tractStyle}).addTo(map);
    }
);

const tractStyle = (feature) => {
    return {
        fillColor: getColor(feature.properties.poverty_income),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// map colors
const getColor = (d) => {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

// show census data
const checkCensus = () => {
    var checkcensus = document.getElementById("census");
    var censusLayers = document.getElementById("censusDropdown");
    if (checkcensus.checked == true){
        censusLayers.style.display = "block";
    } else {
        censusLayers.style.display = "none";
    }
  }


// add items to the Dropdown
const additems2dropdown = () => {
    TractPropertyList.forEach(element => {
        const item = document.createElement("a");
        const textnode = document.createTextNode(element);
        item.appendChild(textnode);
        // select census data propoerty
        item.addEventListener("click", (e) => {
            document.getElementById('censusdropbtn').textContent = element;
            currentTractProperty = element;
        });
        document.getElementById("itemsDropdown").appendChild(item);
    });
}

// show Dropdown
const showitems = () => {
    additems2dropdown();
    document.getElementById("itemsDropdown").classList.toggle("showDropdown");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('showDropdown')) {
                openDropdown.classList.remove('showDropdown');
            }
        }
    } 
    var list = document.getElementById("itemsDropdown");
    if (!list.classList.contains('showDropdown')) {
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
    }
  }