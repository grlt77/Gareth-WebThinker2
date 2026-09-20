let dojoBG;
let fruitGroup;
let fruitTypes = [];
let peach;

function preload(){
    dojoBG = loadImage('assets/dojobackground.png');
    peach = {
        whole:loadImage('assets/peachwhole.png')
    };
    watermelon = {
        whole: loadImage('asser')
    }
    peach['whole']
}
function setup() {
    createCanvas(600, 400);
    world.gravity.y = 10;
}
function draw() {
    image(dojoBG,0,0,width,height)
}