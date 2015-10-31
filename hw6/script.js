/*globals VolumeRenderer, d3, console*/

var renderer,
allHistograms = {};

var color1="ff0000";
var color2="009933";
var color3="0066FF";
var range1 = 0.25;
var range2 = 0.75;
var range3 = 1.0;

function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

$('#colorpicker').on('change', function(){
    color1 = (this.value.replace('#',''));
    console.log(color1);
    updateTransferFunction();
});

$('#colorpicker2').on('change', function(){
    color2 = (this.value.replace('#',''));
    console.log(color2);
    updateTransferFunction();

});
$('#colorpicker3').on('change', function() {
    color3 = (this.value.replace('#',''));
    console.log(color3);
    updateTransferFunction();
});

function updateTransferFunction() {
    renderer.updateTransferFunction(function (value) {
        // ******* Your solution here! *******
        
        // Given a voxel value in the range [0.0, 1.0],
        // return a (probably somewhat transparent) color
        //console.log(value);

        // In this transfer function widget implementation, i 
        // am trying to implment logarithmic transfer function
        // which would convert the exponential transfer function
        // value into scaled logarithmic transfer function value.
        var alpha = 0;
        if(value < 0.05)
        {
            alpha = 0;
        }

        else {
            alpha = ((Math.exp(value) * (0.99)) / Math.exp(1));
            //console.log(alpha);
        }

        if (value >= 0.05 && value < range1) {
            return convertHex(color1, alpha);
            //return 'rgba(' + color1 + ',' + value + ')';
        } 
        else if (value >= range1 && value < range2) {
            return convertHex(color2, alpha);
            //return 'rgba(' + color2 + ',' + value + ')';
        }
        else if (value >= range2 && value < range3) {
            return convertHex(color3, alpha);
            //return 'rgba(' + color3 + ',' + value + ')';

        }
        return 'rgba(' + color3 + ',' + value + ')';
    });
}

function setup() {
    d3.select('#volumeMenu').on('change', function () {
        renderer.switchVolume(this.value);
        console.log(this.value + ' histogram:', getHistogram(this.value, 0.025));
    });
    console.log('bonsai histogram:', getHistogram('bonsai', 0.025));
}

/*

You shouldn't need to edit any code beyond this point
(though, as this assignment is more open-ended, you are
welcome to edit as you see fit)

*/


function getHistogram(volumeName, binSize) {
    /*
    This function resamples the histogram
    and returns bins from 0.0 to 1.0 with
    the appropriate counts
    (binSize should be between 0.0 and 1.0)
    
    */
    
    var steps = 256,    // the original histograms ranges from 0-255, not 0.0-1.0
        result = [],
        thisBin,
        i = 0.0,
        j,
        nextBin;
    while (i < 1.0) {
        thisBin = {
            count : 0,
            lowBound : i,
            highBound : i + binSize
        };
        j = Math.floor(i * steps);
        nextBin = Math.floor((i + binSize) * steps);
        while (j < nextBin && j < steps) {
            thisBin.count += Number(allHistograms[volumeName][j].count);
            j += 1;
        }
        i += binSize;
        result.push(thisBin);
    }
    return result;
}

/*
Program execution starts here:

We create a VolumeRenderer once we've loaded all the csv files,
and VolumeRenderer calls setup() once it has finished loading
its volumes and shader code

*/
var loadedHistograms = 0,
    volumeName,
    histogramsToLoad = {
        'bonsai' : 'volumes/bonsai.histogram.csv',
        'foot' : 'volumes/foot.histogram.csv',
        'teapot' : 'volumes/teapot.histogram.csv'
    };

function generateCollector(name) {
    /*
    This may seem like an odd pattern; why are we generating a function instead of
    doing this inline?
    
    The trick is that the "volumeName" variable in the for loop below changes, but the callbacks
    are asynchronous; by the time any of the files are loaded, "volumeName" will always refer
    to "teapot"**. By generating a function this way, we are storing "volumeName" at the time that
    the call is issued in "name".
    
    ** This is yet ANOTHER javascript quirk: technically, the order that javascript iterates
    over an object's properties is arbitrary (you wouldn't want to rely on the last value
    actually being "teapot"), though in practice most browsers iterate in the order that
    properties were originally assigned.
    
    */
    return function (error, data) {
        if (error) {
            throw new Error("Encountered a problem loading the histograms!");
        }
        allHistograms[name] = data;
        loadedHistograms += 1;
        
        if (loadedHistograms === Object.keys(histogramsToLoad).length) {
            renderer = new VolumeRenderer('renderContainer', {
                'bonsai': 'volumes/bonsai.raw.png',
                'foot': 'volumes/foot.raw.png',
                'teapot': 'volumes/teapot.raw.png'
            }, setup);
        }
    };
}

for(volumeName in histogramsToLoad) {
    if (histogramsToLoad.hasOwnProperty(volumeName)) {
        d3.csv(histogramsToLoad[volumeName], generateCollector(volumeName));
    }
}