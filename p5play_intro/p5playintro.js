let ball;
let box;

function setup() {
  new Canvas(800, 400);
  background(250); //background color

  // Basic shape testing
  // write your codes here
 
  // End Basic shape testing

   // Create a bouncing ball sprite
   ball = new Sprite();
   ball.x=100;
   ball.y=200;
   ball.diameter=40;
   ball.color="blue"

   box = new Sprite();
   box.x=100;
   box.y=100;
   box.w=50;
   box.h=50;
   box.color="Green"

  }

function draw() {
    
}