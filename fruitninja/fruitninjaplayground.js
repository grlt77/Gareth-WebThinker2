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
    if (mouse.pressing()) {
        let trail = new Sprite(mouse.x, mouse.y, 7);
        trail.collider = 'none';
        trail.color = 'green';
        trail.life = 10;
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
function sliceFruit(){
    for(let fruit of fruitGroup) {
        if (fruit.slice) {
            continue;
        }
        let d = dist(mouse.x, mouse.y, fruit.x, fruit.y);

        if(d< ((fruit.d/2)+3)){
            fruit.sliced=true;
            fruit.remove();
        }
    }
}