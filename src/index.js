/** @type {import("../typings/phaser")} */
/* The above loads the phaser.d.ts file so that VSCode has autocomplete for the Phaser API.
If you experience problems with autocomplete, try opening the phaser.d.ts file and scrolling up and down in it.
That may fix the problem -- some weird quirk with VSCode. A new typing file is released with
every new release of Phaser. Make sure it's up-to-date!

At some point, the typings will
be officially added to the official release so that all you'll have to do is do:

npm install @types/phaser

But this hasn't happened yet!
*/

// Bring in all the scenes
import "phaser";

const config = {
  type: Phaser.WEBGL,
  height: 400,
  width: 600,
  backgroundColor: "#bfcc00",
  parent: "Snake",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let snake;
let food;
let cursors;

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
const game = new Phaser.Game(config);

function preload() {
  this.load.image("food", "assets/backgrounds/food.png");
  this.load.image("snake", "assets/backgrounds/snake.png");
}

function create() {

  const gameOver = this.add.text(130, 150, 'Game Over', { fontSize: '64px', color: 'black' });
  let scoreText = 0;
  let score = this.add.text(0,0, 'Score:0', {fontSize: '14px', color: 'black'})
  gameOver.visible = false
  const Food = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize:
    function Food(scene, x, y) {
      Phaser.GameObjects.Image.call(this, scene);
      this.setTexture("food");
      this.setPosition(x * 16, y * 16);
      this.setOrigin(0);

      this.total = 0;

      scene.children.add(this);
    },
    eat: function(){
      let x = Math.random()*560;
      let y = Math.random()*360;
      this.setPosition(x,y)
      this.total += 1;
    }
  });

  const Snake = new Phaser.Class({
    initialize:
    function Snake(scene, x, y) {
      this.headPosition = new Phaser.Geom.Point(x, y);
      this.body = scene.add.group();
      this.head = this.body.create(x * 10, y * 10, "snake");
      this.head.setOrigin(0);
      this.alive = true;

      this.speed = 100;

      this.moveTime = 0;

      this.headedTowards = RIGHT;
      this.direction = RIGHT;
      this.tail = new Phaser.Geom.Point(x, y);
    },
    update: function(time) {
      if (time >= this.moveTime) {
        return this.move(time);
      }
    },
    updateDirection: function(newDirection) {
      switch (newDirection) {
        case LEFT:
          if (this.direction === UP || this.direction === DOWN) {
            this.headedTowards = LEFT;
          }
          break;
        case RIGHT:
          if (this.direction === UP || this.direction === DOWN) {
            this.headedTowards = RIGHT;
          }
          break;
        case UP:
          if (this.direction === LEFT || this.direction === RIGHT) {
            this.headedTowards = UP;
          }
          break;
        case DOWN:
          if (this.direction === LEFT || this.direction === RIGHT) {
            this.headedTowards = DOWN;
          }
          break;
      }
    },
    move: function(time) {
      switch (this.headedTowards) {
        case LEFT:
          this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0,60);
          break;
        case RIGHT:
          this.headPosition.x = Phaser.Math.Wrap( this.headPosition.x + 1,0,60);
          break;
        case UP:
          this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1,0, 40);
          break;
        case DOWN:
          this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0,40);
          break;
      }
      this.direction = this.headedTowards;
      Phaser.Actions.ShiftPosition(
        this.body.getChildren(),
        this.headPosition.x * 10,
        this.headPosition.y * 10,
        1,
        this.tail
      );
      let hit = Phaser.Actions.GetFirst(this.body.getChildren(), { x: this.head.x, y: this.head.y }, 1);
      if(hit) {
        this.alive = false;
        gameOver.visible = true
      } else {

        this.moveTime = time + this.speed;
      }
    },
    grow: function(){
      let extendedBody = this.body.create(this.tail.x, this.tail.y, 'snake')
      extendedBody.setOrigin(0)
    },
    collide: function(){
      console.log('collided')
      if(Math.abs(this.head.x - food.x) <=10 && Math.abs(this.head.y - food.y) <= 10) {
        this.grow();
        food.eat();
        scoreText += 5;
        score.setText('Score:'+ scoreText)
        if(this.speed >= 10 && food.total % 5 === 0) {
          this.speed -= 5;
        }
      }
    }
  });
  snake = new Snake(this, 8, 8);
  food = new Food(this, 9,10);
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  if(!snake.alive) return false
  if (cursors.left.isDown) {
    //move left
    snake.updateDirection(LEFT);
  } else if (cursors.right.isDown) {
    //move right
    snake.updateDirection(RIGHT);
  } else if (cursors.up.isDown) {
    //move up
    snake.updateDirection(UP);
  } else if (cursors.down.isDown) {
    //move down
    snake.updateDirection(DOWN);
  }
  snake.update(time);
  snake.collide()
}
