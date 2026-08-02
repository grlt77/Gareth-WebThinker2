let bird, floor; 
let flapMidImg, bg, base;

function preload() {
    flapMidImg = loadImage('assets/yellowbird-midflap.png');
    bg = loadImage('assets/background-night.png');
    base = loadImage('assets/base.png');
}

function setup(){
    new Canvas(400,600);

    bird = new Sprite();
    bird.x = width / 2;
    bird.y = 200;
    bird.width
}
