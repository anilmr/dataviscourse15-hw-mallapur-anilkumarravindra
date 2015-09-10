/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

window.onload = function() {
  changeData();
};

var mouseOverTransition = function() {
    d3.select(this)
        .attr("fill", "grey");
}

var mouseOutTransition = function() {
    d3.select(this)
        .attr("fill", "steelblue");
}

function staircase() {
    // ****** TODO: PART II ******
    var svgElement = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svgElement.setAttribute("width", 250);
    svgElement.setAttribute("height", 250);
    var barGraph = document.getElementById("barChart1");
    while (barGraph.firstChild) {
        barGraph.removeChild(barGraph.firstChild);
    }
    barGraph.appendChild(svgElement);
    for(var i=1; i<11;i++) {
        var rectElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rectElement.setAttribute("width", 20);
        rectElement.setAttribute("height", 20*i);
        rectElement.setAttribute("y", 200 - 20*i);
        rectElement.setAttribute("x", 20*i);
        svgElement.appendChild(rectElement);
        barGraph.appendChild(svgElement);
    }
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        console.log("Subset of Data");3
        data.forEach(function (d) {
            console.log(d.a);
        });
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a) * 10;
            d.b = parseFloat(d.b) * 10;
        });
    }

    // Set up the scales
    var aScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 250]);
    var bScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 250]);
    var iScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, 250]);

    // ****** TODO: PART III (you will also edit in PART V) ******
    // TODO: Select and update the 'a' bar chart bars

    var p = d3.select(".barChart");
    var childRect = p.selectAll("rect");
    childRect = childRect.remove();

    p.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("x", function(d, i) {return iScale(i); })
        .attr("y", function(d) {return 250 - aScale(d.a); })
        .attr("width", 20)
        .on("mouseover", mouseOverTransition)
        .on("mouseout", mouseOutTransition)
        .transition().duration(750)
            .delay(function(d, i) { return i * 200 })
            .attr("y", function(d) {return 250 - aScale(d.a); })
            .attr("height", function(d) {return aScale(d.a); });
        

    // TODO: Select and update the 'b' bar chart bars

    var q = d3.select("#barChart2");
    var childRect = q.selectAll("rect");
    childRect = childRect.remove();

    q.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("x", function(d, i) {return iScale(i); })
        .attr("y", function(d) {return 250 - bScale(d.b); })
        .attr("width", 20)
        .on("mouseover", mouseOverTransition)
        .on("mouseout", mouseOutTransition)
        .transition().duration(750)
            .delay(function(d, i) { return i * 200 })
            .attr("y", function(d) {return 250 - bScale(d.b); })
            .attr("height", function(d) {return bScale(d.b); });

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return 250 - aScale(d.a);
        });

    p = d3.select(".lines");
    p.select("path")
        .transition()
        .duration(500)
        .delay(100)
        .attr("d", aLineGenerator(data));


    // TODO: Select and update the 'b' line chart path (create your own generator)

    var bLineGenerator = d3.svg.line()
        .x(function(d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return 250 - bScale(d.b);
        });

    p = d3.select("#line2");

    p.select("path")
        .transition()
        .duration(500)
        .delay(100)
        .attr("d", bLineGenerator(data));

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(250)
        .y1(function (d) {
            return (250 - aScale(d.a));
        });

    p = d3.select(".areas");
    p.select("path")
        .transition()
        .duration(500)
        .delay(100)
        .attr("d", aAreaGenerator(data));

    // TODO: Select and update the 'b' area chart path (create your own generator)

    var bAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(250)
        .y1(function (d) {
            return (250 - bScale(d.b));
        }); 

    p = d3.select("#area2");
    p.select("path")
        .transition()
        .duration(500)
        .delay(100)
        .attr("d", bAreaGenerator(data));

    // TODO: Select and update the scatterplot points
// add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var p = d3.select(".scatter");
    var childRect = p.selectAll("circle");
    childRect = childRect.remove();

    p.selectAll("bar")
        .data(data)
        .enter().append("circle")
        .attr("cx", function(d) {return aScale(d.a); })
        .attr("cy", function(d) {return 260 - bScale(d.b) ; })
        .on("click", function(d) {
            console.log(d);
        })
        .on("mouseover", function(d){
            console.log(d);
            tooltip.transition()
               .duration(200)
               .style("opacity", 0.9);
            tooltip.html(d.a + ", " + d.b)
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      })
        .on("mouseout", function(d){
            tooltip.transition()
               .duration(500)
               .style("opacity", 0)})
        .transition().duration(750)
            .delay(function(d, i) { return i * 100 })
            .attr("r", 5);


    // ****** TODO: PART IV ******
}

function changeData() {
    // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    console.log(dataFile);
    d3.csv('data/' + dataFile + '.csv', update);
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    d3.csv('data/' + dataFile + '.csv', function (error, data) {
        var subset = [];
        data.forEach(function (d) {
            if (Math.random() > 0.5) {
                subset.push(d);
            }
        });
        update(error, subset);
    });
}
