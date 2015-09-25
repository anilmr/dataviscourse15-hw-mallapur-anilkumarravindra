// CS-6630: Home Work 3 
// Name: Anil Kumar Ravindra Mallapur
// UnID: u0942509

// Citations:-
//     1. For construction of map graph, I referred example code from https://gist.github.com/mbostock/4090848 and http://bl.ocks.org/mbostock/4090848
//     2. For construction of colorScale, I referred https://github.com/mbostock/d3/wiki/Ordinal-Scales
//     3. For writing forced layout I referred https://github.com/mbostock/d3/wiki/Force-Layout and http://bl.ocks.org/sathomas/11550728


/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var data,
    locationData,
    teamSchedules,
    selectedSeries,
    colorScale;


/* EVENT RESPONSE FUNCTIONS */
function setHover(d) {

    var text = "";
    if(d === null) {
        text = "";
        var note = d3.select("#info")
            .select("text").remove();
        return;
    } else {
        if(d.data_type == "Game") {
            text = d["Home Team Name"] + " at " + d["Stadium Name"];
        } else if(d.data_type == "Team") {
            text = d["name"];
        } else if(d.data_type == "Location") {
            var games = d.games;
            for(var i=0; i<games.length; i++) {
                text += games[i]["Visit Team Name"] + " at " + games[i]["Stadium Name"] + ", ";
            }
        }
    }
    var note = d3.select("#info")
        .append("text")
        .text(text);
}

function clearHover() {

    setHover(null);
}

function changeSelection(d) {

    selectedSeries = []
    if(d.data_type == "Game") {
        selectedSeries.push(d);
    } else if(d.data_type == "Team") {
       selectedSeries = teamSchedules[d["name"]];
    } else {
        selectedSeries = d.games;
    }

    updateBarChart();
    updateForceDirectedGraph();
    updateMap();

}

/* DRAWING FUNCTIONS */

function updateBarChart() {
    var svgBounds = document.getElementById("barChart").getBoundingClientRect();
    xAxisSize = 100;
    yAxisSize = 60;
    var width = svgBounds.width - yAxisSize;
    var height = svgBounds.height - xAxisSize;

    var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .05)
                .domain(selectedSeries.map(function(d) { return d.Date; }));

    var y = d3.scale.linear()
                .range([height,0])
                .domain([0, d3.max(selectedSeries, function(d) { return d.attendance + 10000; })]);

    colorScale = d3.scale.linear()
                    .range(["#d0d1e6", "#034e7b"])
                    .domain([0, d3.max(selectedSeries, function(d) { return d.attendance; })]);

    var xremove = d3.select("#xAxis").selectAll("*").remove();
    var yremove = d3.select("#yAxis").selectAll("*").remove();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var barGraph = d3.select("#barChart")
                        .attr("width", width + yAxisSize)
                        .attr("height", height + xAxisSize);


    barGraph.selectAll('#xAxis')
        .append('svg:g')
        .attr('transform', 'translate(' + (yAxisSize) + ',' + (height) + ')')
        .call(xAxis)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-0.6em")
            .attr("dy", "-.1em")
            .attr("transform", "rotate(-90)" );


    barGraph.selectAll('#yAxis')
        .append('svg:g')
        .attr('transform', 'translate('+ (yAxisSize) + ', 0)')
        .call(yAxis)
        .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")


    var barG = barGraph.select("#bars")
        .attr('transform', 'translate('+ (yAxisSize) + ',' + '0' + ')');
    
    barG.selectAll("rect").remove();

    var bars = barG.selectAll("rect")            
            .data(selectedSeries);
    

    bars.enter().append("rect")
            .style("fill", function(d) {  return colorScale(d.attendance); })
            .attr("x", function(d) { return x(d.Date); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.attendance); })
            .attr("height", function(d) { return height - y(d.attendance); })
            .on("mouseover", setHover)
            .on("mouseout", clearHover)
            .on("click", changeSelection);

}


function updateForceDirectedGraph() {

    var svgBounds = document.getElementById("graph").getBoundingClientRect();
    var width = svgBounds.width;
    var height = svgBounds.height;

    var links = data.edges;
    var nodes = data.vertices;

    var nodeGraph = d3.select("#graph")
        .attr("width", width)
        .attr("height", height);

    var forcedLayout = d3.layout.force()
        .size([width, height])
        .nodes(nodes)
        .links(links)
        .linkDistance(40);

    var linkG = nodeGraph.selectAll("g")
    linkG.selectAll("line").remove();

    var links = linkG.selectAll("#links")
        .data(links)
        .enter().append("line")
        .attr('x1', function(d) { return d.source.x; } )
        .attr('y1', function(d) { return d.source.y; } )
        .attr('x2', function(d) { return d.target.x; } )
        .attr('y2', function(d) { return d.target.y; } )
    
    var nodeG = nodeGraph.selectAll("g")

    nodeG.selectAll("path").remove();
    var nodes = nodeG.selectAll("#nodes")
        .data(nodes)

    nodes.enter().append("path")
        .attr("d", d3.svg.symbol()
            .type(function(d) { 
                if(d.data_type == "Team") {
                    return "triangle-up";
                }
                else {
                    return "circle";
                }
            })
            .size(function(d) {
                if(d.data_type == "Game") {
                    for(var i=0; i < selectedSeries.length; i++) {
                        if(selectedSeries[i]._id === d._id) {
                            return 250;
                        }
                    }
                    return 64;
                } else { return 64; }
            }))
        .attr("class", function (d) {
            if (d.data_type == "Team") {
                return "team";
            }
            else
                return "game";
        })
        .style("fill", function(d) {
            for(var i=0; i < selectedSeries.length; i++) {
                if(d == selectedSeries[i]) {
                    return colorScale(d.attendance);
                }
            }
        })
        .call(forcedLayout.drag);

    nodes.on("mouseover", setHover)
        .on("mouseout", clearHover)
        .on("click", changeSelection);
    
    forcedLayout.on("tick", function() {

        links.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        nodes.attr("transform", function (d) {
            return "translate(" + d.x + ", " + d.y + ")"
        });

        
    });

    forcedLayout.start();
}


function updateMap() {
    
    var gamedata = d3.values(locationData);
    var mapGraph = d3.select("#map");
    var projection = d3.geo.albersUsa()
        .translate([450, 250]).scale([1000]);

    var mapNodes = mapGraph.select("#poins");
    mapNodes.selectAll("path").remove();

    var nodes = mapNodes.selectAll("path")
        .data(gamedata)
        .enter().append("path")
        .attr("d", d3.svg.symbol()
            .type(function(d) { 
                    return "circle";
            })
            .size(function(d) {
                for(var j=0; j<d.games.length; j++) {
                    for(var i=0; i < selectedSeries.length; i++) {
                        if (d.games[j] != undefined) { 
                            if(d.games[j]["Stadium Name"] == selectedSeries[i]["Stadium Name"]) {
                                return 400;
                            }
                        } else { return 100; }
                    }
                }
                return 100;
            }))

        .attr("cx", function (d) {
            return projection(d.longitude);
        })

        .attr("cy", function (d) {
            return projection(d.latitude);
        })
        .attr("transform", function (d) {
            return "translate(" + projection([d.longitude, d.latitude]) + ")";
        })
        .attr("class", "game")
        .style("opacity", 1)
        .style("fill", function(d) {
            var sum = 0;
            var num = 1;
            for(var j=0; j<d.games.length; j++) {
                for(var i=0; i < selectedSeries.length; i++) {
                    if (d.games[j] != undefined) {      
                        if(d.games[j]._id == selectedSeries[i]._id) {
                            sum += d.games[j].attendance;
                            num += 1;
                        }
                    }
                }
            }
            if (sum != 0 && num > 1) {
                return colorScale(sum/num-1);
            } 
            
            
        })
        .on("mouseover", setHover)
        .on("mouseout", clearHover)
        .on("click", changeSelection);
}

function drawStates(usStateData) {

    var map = d3.select("#map");
    var states = d3.selectAll("#states");
    var projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([450, 250]);
    var path = d3.geo.path().projection(projection);
    states.datum(topojson.feature(usStateData, usStateData.objects.states))
        .attr("d", path);

}

/* DATA DERIVATION */

// You won't need to edit any of this code, but you
// definitely WILL need to read through it to
// understand how to do the assignment!

function dateComparator(a, b) {
    // Compare actual dates instead of strings!
    return Date.parse(a.Date) - Date.parse(b.Date);
}

function isObjectInArray(obj, array) {
    // With Javascript primitives (strings, numbers), you
    // can test its presence in an array with
    // array.indexOf(obj) !== -1
    
    // However, with actual objects, we need this
    // helper function:
    var i;
    for (i = 0; i < array.length; i += 1) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function deriveGraphData() {
    // Currently, each edge points to the "_id" attribute
    // of each node with "_outV" and "_inV" attributes.
    // d3.layout.force expects source and target attributes
    // that point to node index numbers.

    // This little snippet adds "source" and "target"
    // attributes to the edges:
    var indexLookup = {};
    data.vertices.forEach(function (d, i) {
        indexLookup[d._id] = i;
    });
    data.edges.forEach(function (d) {
        d.source = indexLookup[d._outV];
        d.target = indexLookup[d._inV];
    });
}

function deriveLocationData() {
    var key;

    // Obviously, lots of games are played in the same location...
    // ... but we only want one interaction target for each
    // location! In fact, when we select a location, we want to
    // know about ALL games that have been played there - which
    // is a different slice of data than what we were given. So
    // let's reshape it ourselves!

    // We're going to create a hash map, keyed by the
    // concatenated latitude / longitude strings of each game
    locationData = {};

    data.vertices.forEach(function (d) {
        // Only deal with games that have a location
        if (d.data_type === "Game" &&
            d.hasOwnProperty('latitude') &&
            d.hasOwnProperty('longitude')) {

            key = d.latitude + "," + d.longitude;

            // Each data item in our new set will be an object
            // with:

            // latitude and longitude properties,

            // a data_type property, similar to the ones in the
            // original dataset that you can use to identify
            // what type of selection the current selection is,
            
            // and a list of all the original game objects that
            // happened at this location
            
            if (!locationData.hasOwnProperty(key)) {
                locationData[key] = {
                    "latitude": d.latitude,
                    "longitude": d.longitude,
                    "data_type": "Location",
                    "games": []
                };
            }
            locationData[key].games.push(d);
        }
    });

    // Finally, let's sort each list of games by date
    for (key in locationData) {
        if (locationData.hasOwnProperty(key)) {
            locationData[key].games = locationData[key].games.sort(dateComparator);
        }
    }
}

function deriveTeamSchedules() {
    var teamName;

    // We're going to need a hash map, keyed by the
    // Name property of each team, containing a list
    // of all the games that team played, ordered by
    // date
    teamSchedules = {};

    // First pass: I'm going to sneakily iterate over
    // the *edges*... this will let me know which teams
    // are associated with which games
    data.edges.forEach(function (d) {
        // "source" always refers to a game; "target" always refers to a team
        teamName = data.vertices[d.target].name;
        if (!teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = [];
        }
        teamSchedules[teamName].push(data.vertices[d.source]);
    });

    // Now that we've added all the game objects, we still need
    // to sort by date
    for (teamName in teamSchedules) {
        if (teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = teamSchedules[teamName].sort(dateComparator);
        }
    }
}


/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;
    
    drawStates(usStateData);
});
d3.json("data/pac12_2013.json", function (error, loadedData) {
    if (error) throw error;

    // Store the data in a global variable for all functions to access
    data = loadedData;

    // These functions help us get slices of the data in
    // different shapes
    deriveGraphData();
    deriveLocationData();
    deriveTeamSchedules();
    
    // Start off with Utah's games selected
    selectedSeries = teamSchedules.Utah;

    // Draw everything for the first time
    updateBarChart();
    updateForceDirectedGraph();
    updateMap();
});