# Mapping Perceived Safety Around Bus Stops In Detroit Using Crowdsourced Street Views

## Background
The concept of social infrastructure takes into account the physical places and organizations that shape the way people interact. This project is rooted in the idea that bus stops are not merely transit locations but pivotal social infrastructures that contribute significantly to the urban social fabric. Perceived safety is a critical aspect of an accessible public transport system. The motivation behind this project is the recognition that the safety of these social spaces is paramount for fostering community interactions and ensuring the well-being of citizens. In Detroit, where the social infrastructure is in a critical phase of redevelopment, ensuring the safety of public spaces is essential for nurturing trust and community spirit.

## Object
This project focuses on the 10-minute-walk-distance areas of bus stops in Detroit. 

## Data
- Street views (Mapillary)
- Bus stop POIs (OSM)
- Road/street lines (OSM)
- Census data
- PlacePulse2.0

## Method
### Tools
- osmdata (R)
- tidycensus (R)
- EloChoice (R)
- fastai/pytorch (Python)
- leaflet JS
### Roadmap
![](images/roadmap.png)
### Data Collection
POIs of bus stops and street lines sourced from OpenStreetMap were collected using OSM API. The bus stop POIs were filtered based on the distance between them because there are usually two opposite stops for one destination for bus routes. The street view at each intersection of street lines within the 10-minute-walk distance of a bus stop was used to assess the perceived safety 


## Interactive map
[view this map](https://billbillbilly.github.io/perceived-safety-around-bus-stops/)

## Reference
Stjernborg, V. (2024). Triggers for feelings of insecurity and perceptions of safety in relation to public transport; the experiences of young and active travellers. Applied Mobilities, 1–21. https://doi.org/10.1080/23800127.2024.2318095




