let dojoBG;

function preload(){
    dojoBG = loadImage('assets/dojobackgroundpng');
}
function setup() {
    createCanvas(600, 400);
    world.gravity.y = 10;
}