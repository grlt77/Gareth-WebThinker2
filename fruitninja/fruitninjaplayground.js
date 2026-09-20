let dojoBG;
let fruitGroup;
let fruitTypes = [];
function preload(){
    dojoBG = loadImage('assets/dojobackground.png');
}
function setup() {
    createCanvas(600, 400);
    world.gravity.y = 10;
}
function draw() {
    image(dojoBG,0,0,width,height)
}