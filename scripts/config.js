

let svg = d3.select(".svg-area").append("svg")
    .attr("height", "350")
    .attr("width", "350")
    .attr("style","margin: 25px")

svg.append("rect")
    .attr("height", "300")
    .attr("width", "300")
    .attr("stroke", "black")
    .attr("stroke-width", "1")
    .attr("fill","white")
    .attr("x","10")
    .attr("y","10")
data_arr = function(){
    let arr = [];
    let pos = [];
    let y = 10
    let index = 0;
    for (let i=0; i<100; i++) {
        if(i % 10 === 0){
            if (i === 0){
                pos['y'] = y;
                arr[i] = pos;
                index = 0;
                pos['x'] = 10;
            }else {
                index = 0;
                pos = [];
                pos['x'] = 10;
                y = y + 30;
                pos['y'] = y;
                arr[i] = pos;
            }
        }else{
            pos =[]
            pos['x'] = 30 * index + 10;
            pos['y'] = y;
            arr[i] = pos;
        }
        index++;
    }
    return arr

}

svg.selectAll().data(data_arr).enter().append("rect")
    .attr("height", "30")
    .attr("width", "30")
    .attr("stroke", "black")
    .attr("stroke-width" , "1")
    .attr("fill","white")
    .attr("x", function (d,i) {
        return d['x']
    })
    .attr("y", function (d, i) {
        return d['y'];
    })
    .attr("id", function (d, i) {
        return "s"+ i
    })



function coloring_matrix(arr) {
    for (let i = 0; i <arr.length; i++){
        svg.select("#s" + i).attr("fill", "white");
        if(arr[i] === -1){
            svg.select("#s" + i).attr("fill","black");
        }
    }
}



let img_1 = cv.imread('img1');
let img_2 = cv.imread('img2');
let img_3 = cv.imread('img3');
let img_4 = cv.imread('img4');
let raw_data = [img_1, img_2, img_3, img_4];


for (let i in raw_data){
     cv.cvtColor(raw_data[i], raw_data[i], cv.COLOR_RGBA2GRAY, 0);
     cv.threshold(raw_data[i],raw_data[i],127,255,cv.THRESH_BINARY);
}
for (let i=0; i<raw_data.length; i++){
    for (let j=0; j<raw_data[i].data.length; j++){
        if(raw_data[i].data[j] === 0){
            raw_data[i].data[j] = -1;
        }else{
            raw_data[i].data[j] = 1;
        }
    }
}


let weights = new Array(raw_data.length);

for (let d = 0; d < weights.length; d++){
    weights[d] = new Array(100);
}
for (let d = 0; d < weights.length; d++){
    for (let i = 0; i < weights[0].length; i++){
        weights[d][i] = new Array(100);
    }
}

for (let d = 0; d < weights.length; d++){
    for(let i = 0; i < weights[0].length; i++){
        // console.log(i, "i");
        for(let j = 0; j < weights[0].length; j++){
            // console.log(j, "j");
            if(i === j){
                weights[d][i][j] = 0
            }
            else if(i > j){
                weights[d][i][j] = weights[d][j][i]
            }
            else{
                weights[d][i][j] = raw_data[d].data8S[i] * raw_data[d].data8S[j]
            }
        }
    }
}

function sum_weights(data_sum) {
    for(let d=0; d< data_sum.length; d++){
        if(d === data_sum.length -1){
            return data_sum[0]
        }else{
            for(let i=0; i<data_sum[0].length; i++){
                for(let j=0; j<data_sum[0].length; j++){
                    data_sum[0][i][j] = data_sum[0][i][j] + data_sum[d+1][i][j];
                }
            }
        }
    }
}


let critical;
let correct;
let final_weights = sum_weights(weights);

function go(selectedPattern, delay, noise){
    let c = noise;
    let c_pixels = raw_data[0].data.length  * c;
    critical = raw_data[selectedPattern].data8S.slice(0);
    console.log(critical);
    for (let i=0; i<c_pixels; i++){
        let pos = Math.floor(Math.random() * (100 + 1));
        if(critical[pos] === 1){
            critical[pos] = -1;
        }else{
            critical[pos] = 1;
        }
    }

    correct = critical.slice(0);
    update(delay);
}


function func1(critical, final_weights, col) {
    let x = 0;
    for(let i=0; i<critical.length; i++){
        x += final_weights[i][col] * critical[i]
    }
    return x;
}


function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}


async function update(delay) {
    for(let i =0; i<critical.length; i++){
        if(i ===0){
            coloring_matrix(correct);
            await sleep(1000);
        }
        let x = critical[i] + func1(critical, final_weights, i);
        if (x > 0)
            correct[i] = 1;
        else if (x === 0)
            correct[i] = critical[i];
        else
            correct[i] = -1;
        coloring_matrix(correct);
        await sleep(delay)

    }
    console.log("finish");
    jQuery(".overlay").addClass("hidden");
}



/////// config setting
let slider = document.getElementById("slider");
let sliderRange = document.getElementById("slider-value");
sliderRange.innerHTML = parseFloat(slider.value * 0.01).toPrecision(2);


slider.oninput = function() {
    sliderRange.innerHTML = parseFloat(this.value * 0.01).toPrecision(2);
};

jQuery(".setting .select-pattern .images .img-pt").click(function () {
    jQuery(".setting .select-pattern .images .img-pt").each(function () {
        let _this = jQuery(this);
        _this.removeClass('active');
    });
    let _this = jQuery(this);
    _this.addClass('active');
});

jQuery(".submit .submit-btn").click(function () {
    let cNoise = jQuery(".slider").val() / 100;
    let delay = jQuery(".delay-inp").val();
    let selectPattern =  jQuery(".setting .images .active").attr("data-id");
    console.log(selectPattern, delay, cNoise);
    go(selectPattern, delay, cNoise);
    jQuery(".overlay").removeClass("hidden");

});