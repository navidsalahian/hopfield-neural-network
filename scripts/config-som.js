

let config_weights = {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'weights',
            data: [],
            borderColor: 'purple',
            pointBorderColor: 'blue',
            borderWidth: 2,
            fill: false,
            tension: 0,
            showLine: true
        },]
    },
    options: {
        maintainAspectRatio: false
    }

};
let config_inputs = {
    type: 'scatter',
    scaleOverride : true,
    scaleSteps : 0.2,
    scaleStepWidth : 10,
    scaleStartValue : -1,
    data: {
        datasets: [{
            label: "inputs",
            data: [],
            borderColor: 'blue',
            pointBorderColor: 'blue',
            borderWidth: 2,
            fill: false,
            tension: 0,
        },]
    },
    options: {
        maintainAspectRatio: false
    }

};
let weightsCharts = new Chart(document.getElementById("weights-canvas"), config_weights);

jQuery(document).ready(function () {
   jQuery("#inputs-canvas, #weights-canvas").css("width", "500px");
});

let inputsCharts = new Chart(document.getElementById("inputs-canvas"), config_inputs);




function resolveAfter2Seconds(weights) {
    return new Promise(resolve => {
        setTimeout(() => {
            config_weights.data.datasets[0].data = [];
            for(let i=0; i < weights.length; i++){
                config_weights.data.datasets[0].data.push({x: weights[i][0].toString(), y: weights[i][1].toString()})
            }
            if(reset !== true) {
                weightsCharts.update();
            }
            resolve(weights);
        }, 500);
    })
        .then((result) => {
            if (reset) {
                // Reject the promise chain
                throw 'cancel';
            }
        })
}

function show_inputs(inputs) {
    for(let i=0; i < inputs.length; i++) {
        let x = inputs[i][0].toString();
        let y = inputs[i][1].toString();
        config_inputs.data.datasets[0].data.push({x: x, y: y})
    }

    inputsCharts.update();
}


function show_weights(weights) {
    config_weights.data.datasets[0].data = [];
    for(let i=0; i < weights.length; i++){
        config_weights.data.datasets[0].data.push({x: weights[i][0].toString(), y: weights[i][1].toString()})
    }
    weightsCharts.update();
};




function circular_dastaset(n = 100, min = 0.7, max = 1) {
    let positions = [];
    for(let i=0; i<n; i++) {
        let angle = Math.random() * 360;
        let radius = Math.random() * (max - min) + min;
        let sinusVal = Math.sin(angle);
        let cosinusVal = Math.cos(angle);
        let posX = sinusVal * radius;
        let posY = cosinusVal * radius;
        positions.push([posX, posY]);
    }
    return positions;
}



function findNearestIndex(input, weights) {

    let distances = [];
    for(let i=0; i< weights.length; i ++){
        let dist = Math.sqrt(Math.pow(input[0] - weights[i][0] ,2) + Math.pow(input[1] - weights[i][1] ,2));
        distances.push(dist)
    }
    return distances.indexOf(Math.min(...distances))
}


let stop = false;
let reset = false;


async function updateWeights(n = 500, inputs, weights, alpha) {
    let x, y, nearest, neigh1, neigh2, h_self, h_neigh, newWeightNearest_x,
        newWeightNearest_y, newWeightNeigh1_x, newWeightNeigh1_y, newWeightNeigh2_x, newWeightNeigh2_y;

    h_self = 1;
    h_neigh = 1;
    let r_neigh = 2;
    for(let i=0; i<n; i++){
        await resolveAfter2Seconds(weights);
        if(stop === true){
            break;
        }
        for (let j=0; j<inputs.length; j++){
            x = inputs[j][0];
            y = inputs[j][1];
            nearest = findNearestIndex([x, y], weights);
            neigh1 = nearest === 0 ? -1 : nearest - 1;
            neigh2 = nearest === weights.length-1 ? -1 : nearest + 1;
            newWeightNearest_x = weights[nearest][0]  + alpha * h_self  * (x  - weights[nearest][0]);
            newWeightNearest_y = weights[nearest][1]  + alpha * h_self  * (y  - weights[nearest][1]);
            weights[nearest]   = [parseFloat(newWeightNearest_x), parseFloat(newWeightNearest_y)];
            for(let k=1; k <= r_neigh; k++) {
                let left = nearest - k;
                if (left >= 0) {
                    newWeightNeigh1_x = weights[left][0] + alpha * h_neigh * (x - weights[left][0]);
                    newWeightNeigh1_y = weights[left][1] + alpha * h_neigh * (y - weights[left][1]);
                    weights[left] = [parseFloat(newWeightNeigh1_x), parseFloat(newWeightNeigh1_y)];
                }
                let right = nearest + k;
                if (right <= 99) {
                    newWeightNeigh2_x = weights[right][0] + alpha * h_neigh * (x - weights[right][0]);
                    newWeightNeigh2_y = weights[right][1] + alpha * h_neigh * (y - weights[right][1]);
                    weights[right] = [parseFloat(newWeightNeigh2_x), parseFloat(newWeightNeigh2_y)];
                }
            }
        }
        alpha = alpha > 0.01 ? alpha * (1-i/n)  : 0.01;
        r_neigh = r_neigh * (1-i/n);
        console.log(i);
    }
    enable_opener();


}

function make_weights(n = 100) {
    let weights = [];
    for(let i=0; i < n; i++){
        let signX = Math.random() > 0.5 ? 1 : -1;
        let signY = Math.random() > 0.5 ? 1 : -1;
        let x = (signX * Math.random()).toFixed(3).toString();
        let y = (signY * Math.random()).toFixed(3).toString();
        weights.push([parseFloat(x), parseFloat(y)]);
    }
    return weights;
}



function toggle_controller_opener(){
    jQuery(".som .controllers").toggleClass("open__controllers");
    let _this = jQuery(this);
    if (jQuery(".som .controllers").hasClass("open__controllers")){
        jQuery(".som .controllers-opener").find(".text").text("Close Controllers");
    }else{
        jQuery(".som .controllers-opener").find(".text").text("Open Controllers");
    }
}


$(document).ready(function () {

    jQuery(".som .controllers-opener").click(function () {
        toggle_controller_opener();
    });
    // run som weights and inputs
    jQuery(".som .controllers .controller button").click(function () {
        toggle_controller_opener();
        reset = false;
        stop = false;
        let numberInputs = parseInt(jQuery(".som .controller .number-inputs").val());
        let numberWeights = parseInt(jQuery(".som .controller .number-weights").val());
        let epoch = parseInt(jQuery(".som .controller .set-epoch").val());
        let radius = parseFloat(jQuery(".som .controller .set-input-radius").val());
        let learningRate = parseFloat(jQuery(".som .controller .set-learning-rate").val());
        console.log(typeof numberInputs, numberWeights, epoch, radius, learningRate);
        let weights = make_weights(numberWeights);
        let inputs = circular_dastaset(numberInputs, radius, 1);
        updateWeights(epoch, inputs, weights, learningRate);
        show_inputs(inputs);
        disable_opener();
    });
    
    jQuery(".som .stop").click(function () {
        stop = true;
    });

    jQuery(".som .reset").click(function () {

        config_weights.data.datasets[0].data = [];
        config_inputs.data.datasets[0].data = [];
        reset = true;
        weightsCharts.update();
        inputsCharts.update();
        enable_opener();
    });

});


function disable_opener() {
    jQuery(".som .controllers-opener").css({
        "cursor": "not-allowed",
        "opacity": 0.5
    });
    jQuery(".som .controllers-opener .text").css({
        "pointer-events": "none",
    });
}

function enable_opener() {
    jQuery(".som .controllers-opener").css({
        "cursor": "pointer",
        "opacity": 1
    });
    jQuery(".som .controllers-opener .text").css({
        "pointer-events": "auto",
    });
}