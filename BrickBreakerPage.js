
const GAMESTATE = {
	PAUSED: 0,
	RUNNING: 1,
	MENU: 2,
	GAMEOVER: 3,
	NEWLEVEL: 4
}

const level1 = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],	
	[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],	
	[0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],	
	[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

const level2 = [
	[0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],	
	[0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],	
	[0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],	
	[0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0]
];

const level3 = [
	[1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],	
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],	
	[1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],	
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// BrickBreaker
class BrickBreaker {
	
	constructor(gameWidth, gameHeight) {
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight
		this.gamestate = GAMESTATE.MENU;
		this.ball = new Ball(this);
		this.paddle = new Paddle(this);
		this.gameObjects = [];
		this.bricks = [];
		this.lives = 3;
		this.levels = [level1, level2, level3];
		this.currentLevel = 0;
		new InputHandler(this.paddle, this);		

	}
	start(){
		
		if(this.gamestate !== GAMESTATE.MENU && this.gamestate !== GAMESTATE.NEWLEVEL) return;
		this.ball.reset();
		this.bricks = buildLevel(this, this.levels[this.currentLevel]);
		this.gameObjects = [this.ball, this.paddle];
		this.gamestate = GAMESTATE.RUNNING;
		
	}
	
	update(deltaTime){
		if(this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;
		
		if(this.gamestate === GAMESTATE.PAUSED || this.gamestate === GAMESTATE.MENU || this.gamestate === GAMESTATE.GAMEOVER) return;
		if(this.bricks.length === 0) {
			this.currentLevel++;
			if(this.currentLevel === 3){
				this.currentLevel = 0;
				this.gamestate = GAMESTATE.MENU
			}
			this.gamestate = GAMESTATE.NEWLEVEL;
			this.start();
		}
		
		[...this.gameObjects, ...this.bricks].forEach((object) => object.update(deltaTime))
		
		this.bricks = this.bricks.filter(brick => !brick.markedForDeletion);
	}
	
	draw(ctx){
		[...this.gameObjects, ...this.bricks].forEach((object) => object.draw(ctx))
		if(this.gamestate === GAMESTATE.PAUSED) {
			ctx.rect(0,0,this.gameWidth,this.gameHeight);
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fill();
			
			ctx.font = "20px Arial";
			ctx.fillStyle = "white";
			ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2);
		}
		
		if(this.gamestate === GAMESTATE.MENU) {
			ctx.rect(0,0,this.gameWidth,this.gameHeight);
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.fill();
			
			ctx.font = "20px Arial";
			ctx.fillStyle = "white";
			ctx.fillText("Press SPACEBAR To Start", this.gameWidth / 3, this.gameHeight / 2);
		}

		if(this.gamestate === GAMESTATE.GAMEOVER) {
			ctx.rect(0,0,this.gameWidth,this.gameHeight);
			ctx.fillStyle = "rgba(0,0,0,1)";
			ctx.fill();
			
			ctx.font = "40px Arial";
			ctx.fillStyle = "white";
			ctx.fillText("GAME OVER", this.gameWidth / 3, this.gameHeight / 2);
		}

	}
	
	togglePauseState(){
		if(this.gamestate == GAMESTATE.PAUSED) {
			this.gamestate = GAMESTATE.RUNNING;
		}
		else{
			this.gamestate = GAMESTATE.PAUSED;
		}
	}
}

class InputHandler {
	
	constructor(paddle, game) {
		document.addEventListener("keydown", event => {
			switch (event.keyCode) {
				case 37:
					paddle.moveLeft()
					break;
				case 39:
					paddle.moveRight()
					break;
			}
		});
		
		document.addEventListener("keyup", event => {
			switch (event.keyCode) {
				case 37:
					if(paddle.speed < 0) paddle.stop()
					break;
				case 39:
					if(paddle.speed > 0) paddle.stop()
					break;
				case 27:
					game.togglePauseState();
					break;
				case 32:
					game.start();
					break;
			}
		});
	}
}


class Paddle {	
	constructor(game) {
		this.gameWidth = game.gameWidth;
		this.width = 80;
		this.height = 10;
		this.maxSpeed = 6;
		this.speed = 0;
		this.position = {
			x: game.gameWidth / 2 - this.width / 2,
			y: game.gameHeight - this.height - 10,
		};
	}	
	draw(ctx) {
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
		ctx.fillStyle = '#009579';
	}
	
	moveLeft(){
		this.speed = -this.maxSpeed;
	}
	
	moveRight(){
		this.speed = this.maxSpeed;
	}
	
	stop(){
		this.speed = 0;
	}
	
	update(deltaTime) {
		this.position.x += this.speed;	
		if(this.position.x < 0) this.position.x = 0;
		if(this.position.x + this.width > this.gameWidth) this.position.x = this.gameWidth - this.width
	}
}

class Ball {
	constructor(game) {
		this.image = document.getElementById('ball');

		this.size = 10;
		this.gameWidth = game.gameWidth;
		this.gameHeight = game.gameHeight;
		this.game = game;
		this.reset();
	}
	
	reset(){
		this.speed = {x: 4, y: -2};
		this.position = {x: 360, y: 300};

		
	}
	
	draw(ctx) {
		ctx.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
	}
	
	update(deltaTime) {
		this.position.x += this.speed.x;
		this.position.y += this.speed.y;
		
		//wall on left or right of screen
		if(this.position.x + this.size > this.gameWidth || this.position.x < 0) {
			this.speed.x = -this.speed.x;
		}
		
		// wall on top 
		if(this.position.y < 0) {
			this.speed.y = -this.speed.y;
		}
		
		// bottom of screen
		if(this.position.y + this.size > this.gameHeight) {
			this.game.lives--;
			this.reset();
		}
		
		if(detectCollision(this, this.game.paddle)) {
			
			this.speed.y = -(this.speed.y + .2) ;
			this.position.y = this.game.paddle.position.y - this.size;
		}
		
	}
}

class Brick {
	
	constructor(game, position) {
		this.image = document.getElementById('brick');
		this.game = game;		
		this.position = position;
		this.width = 25;
		this.height = 10;
		this.markedForDeletion = false;
	}
	
	update() {
		if(detectCollision(this.game.ball, this)) {
			determineBallVelocity(this.game.ball, this);
			this.game.ball.speed.y = -this.game.ball.speed.y;
			this.markedForDeletion = true;
		}
	}
	
	draw(ctx) {
		ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
	}
}

function buildLevel(game, level) {
	let bricks = [];
	level.forEach((row, rowIndex) => {
		row.forEach((brick, brickIndex) => {
			if (brick === 1) {
				let position = {
					x: 25 * brickIndex,	
				 	y: 20 + 24 * rowIndex
				};
				bricks.push(new Brick(game, position));
			}
		});	
	});
	return bricks
}

function detectCollision(ball, gameObject) {
// ball collision with a brick
		let bottomOfBall = ball.position.y + ball.size;
		let topOfBall = ball.position.y;
		let topBoundObject = gameObject.position.y;
		let leftBoundObject = gameObject.position.x;
		let rightBoundObject = gameObject.position.x + gameObject.width;
		let bottomBoundObject = gameObject.position.y + gameObject.height;
		
		if(bottomOfBall >= topBoundObject && 
		   topOfBall <= bottomBoundObject &&
		   ball.position.x >= leftBoundObject && 
		   ball.position.x + ball.size <= rightBoundObject) 
		{
			
			return true;
		}	
		else {
			return false;
		}
}

function determineBallVelocity(ball, gameObject) {
		let bottomOfBall = ball.position.y + ball.size;
		let topOfBall = ball.position.y;
		let leftOfBall = ball.position.x;
		let rightOfBall = ball.position.x + ball.size;
		let topBoundObject = gameObject.position.y;
		let leftBoundObject = gameObject.position.x;
		let rightBoundObject = gameObject.position.x + gameObject.width;
		let bottomBoundObject = gameObject.position.y + gameObject.height;
		
		if(bottomOfBall === topBoundObject){ //if you hit the top of an object
			ball.speed.y = ball.speed.y + 2;
			ball.speed.x = ball.speed.x - 1; 
		}
		
		if(topOfBall === bottomBoundObject){// if you hit the bottom of an object
			ball.speed.y = ball.speed.y + 2;
			ball.speed.x = ball.speed.x - 1; 
		}
		
		if(leftOfBall === leftBoundObject){// if you hit the left side of an object
			ball.speed.y--;
			ball.speed.x++; 			
		}
		
		if(rightOfBall === rightBoundObject){// if you hit the right side of an object
			ball.speed.y--;
			ball.speed.x++; 			
		}
		
		return;
}



let canvas = document.getElementById("BrickBreakerGameScreen");
let ctx = canvas.getContext("2d");
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

let game = new BrickBreaker(GAME_WIDTH, GAME_HEIGHT);
let lastTime = 0;

function gameLoop(timeStamp) {
	let deltaTime = timeStamp - lastTime;
	lastTime = timeStamp;
	ctx.clearRect(0,0, GAME_WIDTH, GAME_HEIGHT);
	game.update(deltaTime);
	game.draw(ctx);
	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);