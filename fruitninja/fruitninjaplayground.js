let dojoBG;
let fruitGroup;
let fruitTypes = [];
let peach;
let fruitHalf;

function preload(){
    dojoBG = loadImage('assets/dojobackground.png');
    peach = {
        whole:loadImage('assets/peachwhole.png'),
        half1:loadImage('assets/peachhalf.png'),
        half2:loadImage('assets/peachhalf.png'),
    };
    watermelon = {
        whole: loadImage('assets/watermelonwhole.png'),
        half1: loadImage('assets/watermelonhalf.png'),
        half1: loadImage('assets/watermelonhalf.png'),
    };
    fruitTypes = [peach,watermelon];
}
function setup() {
    createCanvas(600, 400);
    world.gravity.y = 10;
    fruitGroup = new Group();
    fruitHalf = new Group();
}
function draw() {
    image(dojoBG,0,0,width,height)
    if (frameCount % 120 === 0){
        spawnFruit();
    }
    if (mouse.pressing()) {
        let trail = new Sprite(mouse.x, mouse.y, 7);
        trail.collider = 'none';
        trail.color = 'green';
        trail.life = 10;

        sliceFruit();
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
    fruitGroup.add(fruit);
}
function sliceFruit(){
    for(let fruit of fruitGroup) {
        if (fruit.sliced) {
            continue;
        }
        let d = dist(mouse.x, mouse.y, fruit.x, fruit.y);

        if(d < ((fruit.d / 2) + 3)){
            fruit.sliced=true;
            const fx = fruit.x;
            const fy = fruit.y;
            fruit.remove();
            splitFruit(fx,fruit.type);
        }
    }
}

function splitFruit(x,y,Data){
    let left = new fruitHalves.Sprite(x - 10 ,y,40,40);
    left.img = fruitData.half1;
    left.vel.x = random(-5,2);
    left.rotationSpeed = -5;
    left.life = 30;

    let right = new fruitHalves.Sprite(x + 10 ,y,40,40);
    left.img = fruitData.half2;
    left.vel.x = random(-5,-2);
    left.rotationSpeed = -5;
    left.life = 30;
}