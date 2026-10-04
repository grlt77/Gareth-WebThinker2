let dojoBG;
let fruitGroup;
let fruitTypes = [];
let peach;
let fruitHalves;
let score = 0;
let missed = 0;

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
        half2: loadImage('assets/watermelonhalf.png'),
    };
    fruitTypes = [peach,watermelon];
}
function setup() {
    createCanvas(600, 400);
    world.gravity.y = 10;
    fruitGroup = new Group();
    fruitHalves = new Group();
}
function draw() {
    image(dojoBG,0,0,width,height)
    if (gameState === 'start') {
        fill(0,100);
        rect(0,0,width,height);
        fill(255);
        textAlign(CENTER,CENTER);
        textSize(48);
        text()
    }
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
    stroke(158,70,70);
    fill(255);
    textSize(24);
    textAlign(LEFT,TOP);
    text('Score: ' + score,10,10)

    trackMissedFruits();
    text('missed: ' + missed ,200,10)
}

function trackMissedFruits(){
    for (let fruit of fruitGroup) {
        if (fruit.y > height + 50) {
            fruit.remove();
            missed +=1
        }
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
            splitFruit(fx,fy,fruit.type);
            score += 1;
            break;
        }
    }
}

function splitFruit(x,y,fruitData){
    let left = new Sprite(x - 10 ,y,40,40);
    left.img = fruitData.half1;
    left.vel.x = -3;
    left.vel.y = random(-5,2);
    left.rotationSpeed = -5;
    left.life = 30;

    let right = new Sprite(x + 10 ,y,40,40);
    right.img = fruitData.half2;
    right.vel.x = 3;
    right.vel.y = random(-5,-2);
    right.rotationSpeed = 5;
    right.life = 30;
}
