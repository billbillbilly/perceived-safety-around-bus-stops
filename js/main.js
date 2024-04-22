const BusPropertyList = [
    'safety mean', 'safety median', 
    'safety standard deviation',
    'clusters'
];
let currentBusProperty = 'safety mean';
let currentBusTractProperty = 'select demographic data';
const TractPropertyList = [
    'bus commuters%', 'median income', 
    'poverty population%', 'unemployment%', 
    'highly educated%', 'less educated%'
];
let currentTractProperty = 'bus commuters%';
let geojsonCensusData = 0;
let geojsonBusData = 0;
let color_band = ['navy', 'yellow']
let data_color_band = ['yellow','#fac484','#eb7f86','#ce6693','#424b83', 'navy']
data_color_band = data_color_band.reverse();
let censusScaleBreaks = [0, 0.013790178081690863, 
    0.033642517248807104, 0.06545874154354368, 
    0.1209903482708275, 0.48109965635738833];
let busScaleBreaks = [0.3330510065723543, 0.3558416079522913, 
    0.35918351466718434, 0.36229217450132406, 
    0.3662227432124251, 0.3748221604705592];

let sl_list = [
    'Y = -0.015 × bus_commuters - 0.073 + 0.927WY',
    'Y = 7.99e-08 × median_income - 0.081 + 0.924WY',
    'Y = −0.012 × poverty_pop - 0.078 + 0.919WY',
    'Y = -0.0002 × unemployed_pop - 0.068 + 0.933WY',
    'Y = 0.002 × higher_edu - 0.069 + 0.933WY',
    'Y = − 0.017 × less_edu - 0.076 + 0.924WY '
];

let safety_mean;
let safety_sd;
let bus_commuters;
let median_income;
let poverty_pop;
let unemployed_pop;
let higher_edu;
let less_edu;
let bus_data_array = [];

/* Set up the initial map center and zoom level */
let map = L.map(
    'map', {
        center: [42.351841, -83.086829], // re-center map
        zoom: 12,  // from 1 (zoomed out) to 18 (zoomed in)
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

let busStopLayer = new L.GeoJSON().addTo(map);
let censusTractLayer = new L.GeoJSON().addTo(map);
let datainfo = L.control({position: 'bottomleft'});

/* data visualizatoin - distribution */
fetch("data/bus_stops_dataset.geojson").then(res => res.json()).then(
    data => {
        const layout = {
            grid: {
                rows: 1, 
                columns: 3, 
                pattern: 'independent'
            },
            font: {
                color: 'white',
                family:'monospace',
                size:'8'
            },
            xaxis: {
                showline: true,
                title: {
                    text: 'safety mean',
                    font: {
                      family: 'monospace',
                      size: 8,
                      color: 'white',
                    }
                },
            },
            xaxis2: {
                showline: true,
                title: {
                    text: 'safety median',
                    font: {
                      family: 'monospace',
                      size: 8,
                      color: 'white',
                      automargin: true,
                    }
                },
            },
            xaxis3: {
                showline: true,
                title: {
                    text: 'safety standard deviation',
                    font: {
                      family: 'monospace',
                      size: 8,
                      color: 'white',
                      automargin: true,
                    }
                },
            },
            yaxis: {
                showgrid: false,
                showline: true,
                title: {
                    text: 'frequency',
                    font: {
                      family: 'monospace',
                      size: 8,
                      color: 'white'
                    }
                }
            },
            yaxis2: {
                showgrid: false,
                showline: true
            },
            yaxis3: {
                showgrid: false,
                showline: true
            },
            width: 450, 
            height: 150,
            paper_bgcolor: "rgba(0,0,0,0)", 
            plot_bgcolor: "rgba(0,0,0,0)",
            showlegend: false,
            margin: {
                b: 35,
                t: 15,
                r: 45,
                l: 45
            },
          };
        const config = {
            displayModeBar: false
        }
        safety_mean = data.features.map(feature => feature.properties.safety_mean);
        safety_median = data.features.map(feature => feature.properties.safety_median);
        safety_sd = data.features.map(feature => feature.properties.safety_sd);
        bus_commuters = data.features.map(feature => feature.properties.bus_commuter);
        median_income = data.features.map(feature => feature.properties.median_income);
        poverty_pop = data.features.map(feature => feature.properties.poverty_pop);
        unemployed_pop = data.features.map(feature => feature.properties.unemployed_pop);
        higher_edu = data.features.map(feature => feature.properties.higher_edu);
        less_edu = data.features.map(feature => feature.properties.less_edu);
        clusters = data.features.map(feature => feature.properties.cluster);
        bus_data_array = [safety_mean, safety_median, safety_sd];
        const data_list =[
            safety_mean, 
            safety_median, 
            safety_sd, 
        ]
        let trace = [];
        for (let index = 0; index < data_list.length; index++) {
            const element = data_list[index];
            let safety_data = {
                x: element,
                type: 'histogram',
                xaxis: `x${index+1}`,
                yaxis: `y${index+1}`,
                marker: {color:"rgba(246, 209, 0, 0.8)"},
                displayModeBar: false
            };
            trace.push(safety_data);
        }
        
        Plotly.newPlot('safety_hist', trace, layout, config);
    }
);

const onEachStop = (feature, layer) => {
    if (feature.properties.safety_mean) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    }
}

const highlightFeature = (e) => {
    let layer = e.target;
    layer.setStyle({
        weight: 10,
        color: 'yellow',
        fillOpacity: 1.0
    });
    layer.bringToFront();
    datainfo.update(layer.feature.properties);
}

const resetHighlight = (e) => {
    busStopLayer.resetStyle(e.target);
    datainfo.update();
}

datainfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'datainfo');
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
datainfo.update = function (props) {
    this._div.innerHTML = (props ?
        '<a>Name: ' + props.bus_stop + '</a>' + '<br/>'+
        '<a>Perceived safety mean: ' + props.safety_mean + '</a>' + '<br/>'+
        '<a>Bus commuters (%): ' + props.bus_commuter + '</a>' + '<br/>'+
        '<a>Average median income: ' + props.median_income + '</a>' + '<br/>'+
        '<a>Poverty population (%): ' + props.poverty_pop + '</a>' + '<br/>'+
        '<a>Unemployment population (%): ' + props.unemployed_pop + '</a>' + '<br/>'+
        '<a>Highly educated population (%): ' + props.higher_edu + '</a>' + '<br/>'+
        '<a>Less eaducated population (%): ' + props.less_edu + '</a>' + '<br/>'
        : '<a>Hover over a bus stop</a>');
};

datainfo.addTo(map);

// update bus stop POIs
const update_bus = () => {
    map.removeLayer(busStopLayer);
    fetch("data/bus_stops_dataset.geojson").then(res => res.json()).then(
        data => {
            geojsonBusData = data;
            busStopLayer = L.geoJSON(data, {
                pointToLayer: addPoint, 
                onEachFeature: onEachStop}).addTo(map);
        }
    );
    getdatalegend();
    busStopLayer.bringToFront();
}

const addPoint = (feature, latlng) => {
    let fillColor;
    if (currentBusProperty === BusPropertyList[0]){
        busScaleBreaks = chroma.limits(safety_mean, 'q', 5);
        const colorScale = chroma.scale(data_color_band).domain(busScaleBreaks);
        fillColor = colorScale(feature.properties.safety_mean).hex();
    } else if (currentBusProperty === BusPropertyList[2]) {
        busScaleBreaks = chroma.limits(safety_sd, 'q', 5);
        const colorScale = chroma.scale(data_color_band).domain(busScaleBreaks);
        fillColor = colorScale(feature.properties.safety_sd).hex();
    } else if (currentBusProperty === BusPropertyList[1]) {
        busScaleBreaks = chroma.limits(safety_median, 'q', 5);
        const colorScale = chroma.scale(data_color_band).domain(busScaleBreaks);
        fillColor = colorScale(feature.properties.safety_median).hex();
    } else if (currentBusProperty === BusPropertyList[3]) {
        busScaleBreaks = chroma.limits(clusters, 'q', 5);
        const colorScale = chroma.scale(data_color_band).domain(busScaleBreaks);
        fillColor = colorScale(feature.properties.cluster).hex();
    }
    let ptSsize = 4;
    let target_feature = 0;
    if (currentBusTractProperty === TractPropertyList[0]) {
        const max_min_func = (data) => {
            return (data-Math.min(...bus_commuters))/(Math.max(...bus_commuters)-Math.min(...bus_commuters))*8;
        }
        ptSsize = max_min_func(feature.properties.bus_commuter);
    } else if (currentBusTractProperty === TractPropertyList[1]) {
        const max_min_func = (data) => {
            return (data-Math.min(...median_income))/(Math.max(...median_income)-Math.min(...median_income))*8;
        }
        ptSsize = max_min_func(feature.properties.median_income);
    } else if (currentBusTractProperty === TractPropertyList[2]) {
        const max_min_func = (data) => {
            return (data-Math.min(...poverty_pop))/(Math.max(...poverty_pop)-Math.min(...poverty_pop))*8;
        }
        ptSsize = max_min_func(feature.properties.poverty_pop);
    } else if (currentBusTractProperty === TractPropertyList[3]) {
        const max_min_func = (data) => {
            return (data-Math.min(...unemployed_pop))/(Math.max(...unemployed_pop)-Math.min(...unemployed_pop))*8;
        }
        ptSsize = max_min_func(feature.properties.unemployed_pop);
    } else if (currentBusTractProperty === TractPropertyList[4]) {
        const max_min_func = (data) => {
            return (data-Math.min(...higher_edu))/(Math.max(...higher_edu)-Math.min(...higher_edu))*8;
        }
        ptSsize = max_min_func(feature.properties.higher_edu);
    } else if (currentBusTractProperty === TractPropertyList[5]) {
        const max_min_func = (data) => {
            return (data-Math.min(...less_edu))/(Math.max(...less_edu)-Math.min(...less_edu))*8;
        }
        ptSsize = max_min_func(feature.properties.less_edu);
    }
    
    if (currentBusTractProperty === 'select demographic data') {
        ptSsize = 4;
    }

    return L.circleMarker(latlng, {
        radius: ptSsize,
        fillColor: fillColor,
        fillOpacity: 0.6,
        stroke: false
    })
}

const max_min = (input) => {
    const max_min_func = (data) => {
        return (data-Math.min(input))/(Math.max(input)-Math.min(input));
    }
    return max_min_func;
}

const getdatalegend = () => {
    if (BusPropertyList.includes(currentBusProperty)) {
        if (currentBusProperty !== 'clusters' && bus_data_array.length !== 0) {
            let index_ = currentBusProperty.indexOf(currentBusProperty);
            busScaleBreaks = chroma.limits(bus_data_array[index_], 'q', 5);
        }
        const datacolorScale = chroma.scale(data_color_band).domain(busScaleBreaks);
        const datalegend = document.getElementById('datalegend');
        datalegend.innerHTML = '<div class="buslegend-scale">';
        let dataranges = [];
        for (let i = 0; i < 5; i++) {
            b1 = busScaleBreaks[i];
            b2 = busScaleBreaks[i+1];
            dataranges.push(`${Math.round(b1*1000)/1000} - ${Math.round(b2*1000)/1000}`);
        }
        let low_v = document.createElement('div');
        let high_v = document.createElement('div');
        low_v.innerHTML = `<a>low</a>`;
        high_v.innerHTML = `<a>high</a>`;
        if (currentBusProperty !== 'clusters') {
            datalegend.children[0].appendChild(low_v);
        }
        for (let index = 0; index < dataranges.length; index++) {
            const colorBox = document.createElement('div');
            colorBox.className = 'buslegend-color-box';
            colorBox.style.backgroundColor = datacolorScale(busScaleBreaks[index]).hex();
            const rangeDiv = document.createElement('div');
            rangeDiv.className = 'buslegend-range';
            rangeDiv.appendChild(colorBox);
            if (currentBusProperty === 'clusters') {
                const clusterA = document.createElement('a');
                clusterA.innerText = `${index+1}`;
                rangeDiv.appendChild(clusterA);
            }
            datalegend.children[0].appendChild(rangeDiv);
        }
        if (currentBusProperty !== 'clusters') {
            datalegend.children[0].appendChild(high_v);
        }
        datalegend.innerHTML += '</div>';
    }
}

const showRegression = (index) => {
    console.log(index);
    const sldiv = document.getElementById('sl');
    if (index >= 0) {
        sldiv.innerHTML = `<a>${sl_list[index]}</a>` + 
        '<br/>' + '<a>(p < 0.001)</a>';
    } else {
        sldiv.innerHTML = `<a></a>`;
    }
}

// Do not move
update_bus();

//update tract polygon
const update_census = () => {
    map.removeLayer(censusTractLayer);
    fetch("data/detroit_tract_poly.geojson").then(res => res.json()).then(
        data => {
            geojsonCensusData = data;
            censusTractLayer = L.geoJSON(data, {style:tractStyle}).addTo(map);
        }
    );
    censusTractLayer.bringToBack();
    getLegendScale();
}

const tractStyle = (feature) => {
    let fillColor;
    if (currentTractProperty === TractPropertyList[0]){
        let data = geojsonCensusData.features.map(feature => feature.properties.bus_pop);
        censusScaleBreaks = chroma.limits(data, 'q', 5);
        const colorScale = chroma.scale(color_band).domain(censusScaleBreaks);
        fillColor = colorScale(feature.properties.bus_pop).hex();
    } else if (currentTractProperty === TractPropertyList[1]) {
        let data = geojsonCensusData.features.map(feature => feature.properties.median_income);
        let quantileBreaks = chroma.limits(data, 'q', 5);
        censusScaleBreaks = quantileBreaks;
        const colorScale = chroma.scale(color_band).domain(quantileBreaks);
        fillColor = colorScale(feature.properties.median_income).hex();
    } else if (currentTractProperty === TractPropertyList[2]) {
        let data = geojsonCensusData.features.map(feature => feature.properties.poverty_pop);
        let quantileBreaks = chroma.limits(data, 'q', 5);
        censusScaleBreaks = quantileBreaks;
        const colorScale = chroma.scale(color_band).domain(quantileBreaks);
        fillColor = colorScale(feature.properties.poverty_pop).hex();
    } else if (currentTractProperty === TractPropertyList[3]) {
        let data = geojsonCensusData.features.map(feature => feature.properties.unemployed_pop);
        let quantileBreaks = chroma.limits(data, 'q', 5);
        censusScaleBreaks = quantileBreaks;
        const colorScale = chroma.scale(color_band).domain(quantileBreaks);
        fillColor = colorScale(feature.properties.unemployed_pop).hex();
    } else if (currentTractProperty === TractPropertyList[4]) {
        let data = geojsonCensusData.features.map(feature => feature.properties.higher_edu);
        let quantileBreaks = chroma.limits(data, 'q', 5);
        censusScaleBreaks = quantileBreaks;
        const colorScale = chroma.scale(color_band).domain(quantileBreaks);
        fillColor = colorScale(feature.properties.higher_edu).hex();
    } else if (currentTractProperty === TractPropertyList[5]) {
        let data = geojsonCensusData.features.map(feature => feature.properties.less_edu);
        let quantileBreaks = chroma.limits(data, 'q', 5);
        censusScaleBreaks = quantileBreaks;
        const colorScale = chroma.scale(color_band).domain(quantileBreaks);
        fillColor = colorScale(feature.properties.less_edu).hex();
    }
    return {
        fillColor: fillColor,
        color: 'white',
        weight: 2,
        opacity: 0.1,
        fillOpacity: 0.6
    };
}

const getLegendScale = () => {
    if (geojsonCensusData !== 0) {
        if (currentTractProperty === TractPropertyList[0]){
            let data = geojsonCensusData.features.map(feature => feature.properties.bus_pop);
            censusScaleBreaks = chroma.limits(data, 'q', 5);
        } else if (currentTractProperty === TractPropertyList[1]) {
            let data = geojsonCensusData.features.map(feature => feature.properties.median_income);
            censusScaleBreaks = chroma.limits(data, 'q', 5);
        } else if (currentTractProperty === TractPropertyList[2]) {
            let data = geojsonCensusData.features.map(feature => feature.properties.poverty_pop);
            censusScaleBreaks = chroma.limits(data, 'q', 5);
        } else if (currentTractProperty === TractPropertyList[3]) {
            let data = geojsonCensusData.features.map(feature => feature.properties.unemployed_pop);
            censusScaleBreaks = chroma.limits(data, 'q', 5);
        } else if (currentTractProperty === TractPropertyList[4]) {
            let data = geojsonCensusData.features.map(feature => feature.properties.higher_edu);
            censusScaleBreaks = chroma.limits(data, 'q', 5);
        } else if (currentTractProperty === TractPropertyList[5]) {
            let data = geojsonCensusData.features.map(feature => feature.properties.less_edu);
            censusScaleBreaks = chroma.limits(data, 'q', 5);
        }
    }
    
    // define the color scale for the legend
    const colorScale = chroma.scale(color_band).domain(censusScaleBreaks);
    // create the legend
    const legend = document.getElementById('censuslegend');
    legend.innerHTML = '<div class="censuslegend-scale">';
    let ranges = [];
    for (let i = 0; i < 5; i++) {
        b1 = censusScaleBreaks[i];
        b2 = censusScaleBreaks[i+1]
        ranges.push(`${Math.round(b1*1000)/1000} - ${Math.round(b2*1000)/1000}`);
    }
    // populate the legend with the color scale
    ranges.forEach((range, index) => {
        const colorBox = document.createElement('div');
        colorBox.className = 'censuslegend-color-box';
        colorBox.style.backgroundColor = colorScale(censusScaleBreaks[index]).hex();
        
        const label = document.createElement('span');
        label.style.color = "white";
        label.innerHTML = range;
        
        const rangeDiv = document.createElement('div');
        rangeDiv.className = 'censuslegend-range';
        rangeDiv.appendChild(colorBox);
        rangeDiv.appendChild(label);
        
        legend.children[0].appendChild(rangeDiv);
    });
    legend.innerHTML += '</div>';
}

// show census data
const checkCensus = () => {
    let checkcensus = document.getElementById("census");
    let censusLayers = document.getElementById("censusDropdown");
    let censuslegend = document.getElementById("censuslegend");
    if (checkcensus.checked == true){
        censusLayers.style.display = "block";
        censuslegend.style.display = "";
        update_census();
    } else {
        censusLayers.style.display = "none";
        censuslegend.style.display = "none";
        map.removeLayer(censusTractLayer);
    }
}

// add items to the Dropdown
const additems2dropdown = (input) => {
    if (input === 'busdropbtn') {
        BusPropertyList.forEach(element => {
            const item = document.createElement("a");
            const textnode = document.createTextNode(element);
            item.appendChild(textnode);
            // select census data propoerty
            item.addEventListener("click", (e) => {
                document.getElementById('busdropbtn').textContent = element;
                currentBusProperty = element;
                update_bus();
            });
            document.getElementById("dataDropdown").appendChild(item);
        });
    } else if (input === 'censusdropbtn' || input === 'busdropbtn2') {
        if (input === 'busdropbtn2') {
            const init_item = document.createElement("a");
            const init_textnode = document.createTextNode('select demographic data');
            init_item.appendChild(init_textnode);
            init_item.addEventListener("click", (e) => {
                document.getElementById('busdropbtn2').textContent = 'select demographic data';
                currentBusTractProperty = 'select demographic data';
                let index_ = TractPropertyList.indexOf(currentBusTractProperty);
                showRegression(index_);
                update_bus();
            });
            document.getElementById("dataDropdown2").appendChild(init_item);
        }
        TractPropertyList.forEach(element => {
            const item = document.createElement("a");
            const textnode = document.createTextNode(element);
            item.appendChild(textnode);
            // select census data propoerty
            if (input === 'censusdropbtn') {
                item.addEventListener("click", (e) => {
                    document.getElementById('censusdropbtn').textContent = element;
                    currentTractProperty = element;
                    update_census();
                });
                document.getElementById("itemsDropdown").appendChild(item);
            } else {
                item.addEventListener("click", (e) => {
                    document.getElementById('busdropbtn2').textContent = element;
                    currentBusTractProperty = element;
                    let index_ = TractPropertyList.indexOf(currentBusTractProperty);
                    showRegression(index_);
                    update_bus();
                });
                document.getElementById("dataDropdown2").appendChild(item);
            }
        });
    }
}

// show Dropdown
const showitems = (id) => {
    if (id === 'busdropbtn') {
        additems2dropdown(id);
        document.getElementById("dataDropdown").classList.toggle("showDropdown");
    } else if (id === 'busdropbtn2') {
        additems2dropdown(id);
        document.getElementById("dataDropdown2").classList.toggle("showDropdown");
    } else {
        additems2dropdown(id);
        document.getElementById("itemsDropdown").classList.toggle("showDropdown");
    }
    
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        let dropdowns = document.getElementsByClassName("dropdown-content");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('showDropdown')) {
                openDropdown.classList.remove('showDropdown');
            }
        }
    } 
    let dataL = document.getElementById("dataDropdown");
    let dataL2 = document.getElementById("dataDropdown2");
    let list = document.getElementById("itemsDropdown");
    if (!dataL.classList.contains('showDropdown')) {
        while (dataL.hasChildNodes()) {
            dataL.removeChild(dataL.firstChild);
        }
    }
    if (!dataL2.classList.contains('showDropdown')) {
        while (dataL2.hasChildNodes()) {
            dataL2.removeChild(dataL2.firstChild);
        }
    }
    if (!list.classList.contains('showDropdown')) {
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
    }
}