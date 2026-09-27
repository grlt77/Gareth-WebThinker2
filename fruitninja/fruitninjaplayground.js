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
        whole: loadImage('assets/watermelonwhole.png')
    };
    fruitTypes = [peach,watermelon];
}
function setup() {
    createCanvas(600, 400);
    world.gravity.y = 10;
}
function draw() {
    image(dojoBG,0,0,width,height)
    if (frameCount % 120 === 0){
        spawnFruit();
    }
    if (mouse.presses()) {
        let trail = new Sprite(mouse.x, mouse.y, 7);
        trail.collider = 'none';
        trail.color = 'green';
        
    }
}

function spawnFruit(){
    let fruitData =random(fruitTypes);
    let randomx = random(300,500);
    let fruit = new Sprite(randomx, height+20,40);
    fruit.image =fruitData.whole;
    fruit.type = fruitData;
    fruit.vel.y = random(-10,-14);
    fruit.vel.x = random(-2,2);
    fruit.friction = 0;
}