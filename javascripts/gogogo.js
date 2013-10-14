/*window.onmousemove = handleMouseMove;
function handleMouseMove(event){
	event = event || window.event;
	document.getElementById('userBox').style.left = event.clientX+"px";
	document.getElementById('userBox').style.top = event.clientY+"px";
}*/
var Game = { };
var FPS = 60;
var directionals = {
	left: false,
	up: false,
	right: false,
	down: false,
	jump: false,
	shoot: false
};

var griffin = {
	STATE: "IDLE",
	position: {
		left: 0,
		top: window.innerHeight/2
	},
	velocity: {
		left: 0,
		top: 0
	},
	acceleration: {
		left: 0,
		top: 0
	},
	bounds: {
		height: 64,
		width: 64
	},
	bullets: {},
	totalBulletCount: 0,
	jumpVelocity: -10,
	floatTime: 5,
	maxRunSpeed: 8
};
var jumpTime = 0;

//shooting targets
var targets = {
	target1: {
		position: {
			top: window.innerHeight - 300,
			left: 500,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target2: {
		position: {
			top: window.innerHeight - 340,
			left: 510,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target3: {
		position: {
			top: window.innerHeight - 300,
			left: 710,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target4: {
		position: {
			top: window.innerHeight - 200,
			left: 510,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target5: {
		position: {
			top: window.innerHeight - 200,
			left: 610,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target6: {
		position: {
			top: window.innerHeight - 200,
			left: 710,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target7: {
		position: {
			top: window.innerHeight - 200,
			left: 560,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 0,
			g: 0,
			b: 0
		},
		STATE: "ALIVE"
	},
	target8: {
		position: {
			top: window.innerHeight - 200,
			left: 540,
			z: 0
		},
		bounds: {
			height: 30,
			width: 30
		},
		rgb: {
			r: 100,
			g: 280,
			b: 50
		},
		STATE: "ALIVE"
	}
}

var platforms = {}

var particleContainer = {}

var constructors = {
	createPlatform: function(position, bounds, rgb){
		this.position = position;
		this.bounds = bounds || {height: 5,	width: 200};
		this.rgb = rgb || {r: 0, g: 0, b: 0};
	},
	createBullet: function(position, velocity, acceleration){ //refactor pos vel and acc into object constructors too?
		this.position = position;
		this.velocity = velocity;
		this.acceleration = acceleration || {left:0,top:0};
		this.bounds = { 
			height: 4,
			width: 12
		};
		this.STATE = "NEW";
	},
	createParticle: function(position, velocity, acceleration, lifecycle){
		this.position = position;
		this.velocity = velocity;
		this.acceleration = acceleration;
		this.bounds = {
			height: 2,
			width: 2
		};
		this.lifecycle = lifecycle;
	}
}

function generateParticles(bullet, target, numParticles){
	for(var i = 0 ; i < numParticles ; i++){
		var position = {left: getRandomArbitrary(target.position.left, target.position.left+target.bounds.width), top: getRandomArbitrary(target.position.top, target.position.top+target.bounds.height)};
		var velocity = {left: getRandomArbitrary(0, 1)*(bullet.velocity.left+getRandomArbitrary(-1, 1)), top: getRandomArbitrary(0, 1)*(bullet.velocity.top+getRandomArbitrary(-1, 1))};
		// var acceleration = {left: getRandomArbitrary(-1, 1), top: getRandomArbitrary(-1, 1)};
		var acceleration = {left: 0, top: 0};
		var lifecycle = getRandomInt(5, 200);
		particleContainer["particle"+Object.keys(particleContainer).length+i] = new constructors.createParticle(position, velocity, acceleration, lifecycle);
	}
	console.log(Object.keys(particleContainer).length);
}

/*var velocity = {
	left: 0,
	top: 0
};
var position = {
	left: 0,
	top: 0
};
var acceleration = {
	left: 0,
	top: 0
};*/

var debug = false;
var debugCounter = 0;
var GRAVITY = 4;
var TERMINALVELOCITY = 15;

/*document.onkeydown = function(event) {
	event = event || window.event;
    if(event.keyCode == 37) //left
    	leftval--;
    if(event.keyCode == 38) //up
    	topval--;
    if(event.keyCode == 39) //right
    	leftval++;
    if(event.keyCode == 40) //down
    	topval++;
};*/

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

//make a platformer

Game.initialize = function(){
	platforms["plat1"] = new constructors.createPlatform({top: window.innerHeight - 30, left: 64, z: 0});
	platforms["plat2"] = new constructors.createPlatform({top: window.innerHeight - 50, left: 300, z: 0});
	platforms["plat3"] = new constructors.createPlatform({top: window.innerHeight - 150, left: 50, z: 0}, {height: 5,	width: 214});
	platforms["plat4"] = new constructors.createPlatform({top: window.innerHeight - 75, left: 600, z: 0}, {height: 5,	width: 214});

	document.onkeydown = function(event) {
		event = event || window.event;
	    if(event.keyCode == 37) //left
	    	directionals.left = true;
	    if(event.keyCode == 38) //up
	    	directionals.up = true;
	    if(event.keyCode == 39) //right
	    	directionals.right = true;
	    if(event.keyCode == 40) //down
	    	directionals.down = true;
	    if(event.keyCode == 90)
	    	directionals.jump = true;
	    if(event.keyCode == 88)
	    	directionals.shoot = true;
	    if(event.keyCode == 68)
	    	debug = !debug;
	    if(debug){
	    	//console.log("Key Press: "+event.keyCode);
	    }
	};
	document.onkeyup = function(event) {
		event = event || window.event;
	    if(event.keyCode == 37) //left
	    	directionals.left = false;
	    if(event.keyCode == 38) //up
	    	directionals.up = false;
	    if(event.keyCode == 39) //right
	    	directionals.right = false;
	    if(event.keyCode == 40) //down
	    	directionals.down = false;
	    if(event.keyCode == 90)
	    	directionals.jump = false;
	    if(event.keyCode == 88)
	    	directionals.shoot = false;
	    // if(event.keyCode == 90)
	    // 	directionals.jump = false;
	};
}

Game.run = function() {
	Game.update();
	Game.draw();
};

function getFriction(){
	if(griffin.velocity.left < 0.1 && griffin.velocity.left > -0.1)
		return 0;
	return 0.90;
}

function boundsCollide(a, b){
	return !(a.position.left > b.position.left + b.bounds.width || a.position.left + a.bounds.width < b.position.left || a.position.top > b.position.top + b.bounds.height || a.position.top + a.bounds.height < b.position.top);
}

function distanceBetweenPoints_Position(a, b){
	return Math.sqrt(Math.pow(b.top-a.top, 2)+Math.pow(b.left-a.left, 2));
}

function collisionCalc(){
	platformCollision();
	bulletCollision();
}

function bulletCollision(){
	for(b in griffin.bullets){
		if(griffin.bullets[b].position.top < 0 || griffin.bullets[b].position.top > window.innerHeight || griffin.bullets[b].position.left < 0 || griffin.bullets[b].position.left > window.innerWidth){
			griffin.bullets[b].STATE = "USED";
		}
		for(t in targets){
			if(distanceBetweenPoints_Position(griffin.bullets[b].position, targets[t].position) < 500)
			{
				if(boundsCollide(griffin.bullets[b], targets[t])){
					if(targets[t].STATE == "HURT")
					{
						targets[t].STATE = "DEAD";
						griffin.bullets[b].STATE = "USED";
						generateParticles(griffin.bullets[b], targets[t], (targets[t].bounds.width*targets[t].bounds.height)/(4*1));
					} else if(targets[t].STATE == "ALIVE"){
						targets[t].STATE = "HURT";
						griffin.bullets[b].STATE = "USED";
						generateParticles(griffin.bullets[b], targets[t], (targets[t].bounds.width*targets[t].bounds.height)/(4*4));
					}
				}
			}
		}
	}
}

function platformCollision(){
	/* if(griffin.position.top + griffin.velocity.top > window.innerHeight - 64) {
		griffin.position.top = window.innerHeight - 64;
		griffin.velocity.top = 0;
	} else if(griffin.position.top + griffin.velocity.top < 0) {
		griffin.position.top = 0;
		griffin.velocity.top = 0;
	} else {
		griffin.position.top += griffin.velocity.top;
	}

	if(griffin.position.left + griffin.velocity.left > window.innerWidth - 64) {
		griffin.position.left = window.innerWidth - 64;
		griffin.velocity.left = 0;
	} else if(griffin.position.left + griffin.velocity.left < 0) {
		griffin.position.left = 0;
		griffin.velocity.left = 0;
	} else {
		griffin.position.left += griffin.velocity.left;
	} */

	for(k in platforms) {
		if(griffin.position.top + griffin.velocity.top > platforms[k].position.top - griffin.bounds.height
			&& !(griffin.position.left + griffin.bounds.width < platforms[k].position.left)
			&& !(griffin.position.left > platforms[k].position.left + platforms[k].bounds.width)
			&& griffin.position.top + griffin.bounds.height <= platforms[k].position.top)
		{
			griffin.position.top = platforms[k].position.top - griffin.bounds.height;
			griffin.velocity.top = 0;
			/*if(griffin.velocity.left == 0)
				griffin.STATE = "IDLE";
			if(griffin.velocity.left > 0 && griffin.STATE != "RUNNINGLEFT" && griffin.STATE != "RUNNINGRIGHT")
				griffin.STATE = "FACINGRIGHT";
			if(griffin.velocity.left < 0 && griffin.STATE != "RUNNINGLEFT" && griffin.STATE != "RUNNINGRIGHT")
				griffin.STATE = "FACINGLEFT";*/
			if(Math.abs(griffin.velocity.left) < 2)
			{
				if(griffin.STATE == "RUNNINGRIGHT")
					griffin.STATE = "FACINGRIGHT";
				if(griffin.STATE == "RUNNINGLEFT")
					griffin.STATE = "FACINGLEFT";
			}
			directionals.jump = false;
			jumpTime = 0;
		}
	}
	griffin.position.top += griffin.velocity.top;
	griffin.position.left += griffin.velocity.left;
}

function xcontainsy(x, y){
	if(x.indexOf(y) != -1)
		return true;
	else
		return false;
}

Game.update = function() {
	for(k in platforms){
		//platforms[k].position.top = window.innerHeight - platforms[k].position.fromBottom;
		//platforms[k].bounds.height = window.innerHeight - platforms[k].position.top;
	}

	if(directionals.shoot){
		if(xcontainsy(griffin.STATE, "LEFT")){
			griffin.bullets["bullet"+griffin.totalBulletCount] = new constructors.createBullet({left: griffin.position.left, top: griffin.position.top+(griffin.bounds.height/4)}, {left: -30, top: 0}, {left: 0, top: 0});
			griffin.totalBulletCount++;
			directionals.shoot = false; //change this later for cooldowns etc
		} else if(xcontainsy(griffin.STATE, "RIGHT")){
			griffin.bullets["bullet"+griffin.totalBulletCount] = new constructors.createBullet({left: griffin.position.left+(griffin.bounds.width/2), top: griffin.position.top+(griffin.bounds.height/4)}, {left: 30, top: 0}, {left: 0, top: 0});
			griffin.totalBulletCount++;
			directionals.shoot = false; //change this later for cooldowns etc
		}
	}

	for(k in griffin.bullets){
		// griffin.bullets[k].acceleration.top = GRAVITY/4;
		griffin.bullets[k].velocity.left += griffin.bullets[k].acceleration.left;
		griffin.bullets[k].velocity.top += griffin.bullets[k].acceleration.top;
		griffin.bullets[k].velocity.left *= 1;
		griffin.bullets[k].velocity.top *= 1;
		griffin.bullets[k].position.left += griffin.bullets[k].velocity.left;
		griffin.bullets[k].position.top += griffin.bullets[k].velocity.top;
	}

	for(k in particleContainer){
		particleContainer[k].acceleration.top = GRAVITY/80;
		particleContainer[k].velocity.left += particleContainer[k].acceleration.left;
		particleContainer[k].velocity.top += particleContainer[k].acceleration.top;
		particleContainer[k].velocity.left *= getRandomArbitrary(0.98, 1);
		particleContainer[k].velocity.top *= getRandomArbitrary(0.98, 1);
		particleContainer[k].position.left += particleContainer[k].velocity.left;
		particleContainer[k].position.top += particleContainer[k].velocity.top;
		particleContainer[k].lifecycle--;
	}

	griffin.acceleration.top += GRAVITY;
	/*document.onkeydown = function(event) {
		event = event || window.event;
	    if(event.keyCode == 37) //left
	    	acceleration.left-=4;
	    if(event.keyCode == 38) //up
	    	acceleration.top-=4;
	    if(event.keyCode == 39) //right
	    	acceleration.left+=4;
	    if(event.keyCode == 40) //down
	    	acceleration.top+=4;
	    if(velocity.left > 16){
	    	velocity.left = 16;
	    }
	    if(velocity.top > 16){
	    	velocity.top = 16;
	    }
	    if(velocity.left < -16){
	    	velocity.left = -16;
	    }
	    if(velocity.top < -16){
	    	velocity.top = -16;
	    }
	};*/

	if(directionals.left){
		if(!xcontainsy(griffin.STATE, "JUMPING"))
			griffin.STATE = "RUNNINGLEFT";
		else
			griffin.STATE = "JUMPINGLEFT" //remove for ssbm
		griffin.acceleration.left-=2;
	}
	/*if(directionals.up)
	griffin.acceleration.top-=2;*/
	if(directionals.right){
		if(!xcontainsy(griffin.STATE, "JUMPING"))
			griffin.STATE = "RUNNINGRIGHT"
		else
			griffin.STATE = "JUMPINGRIGHT" //remove for ssbm
		griffin.acceleration.left+=2;
	}


	// if(directionals.down)
	// 	acceleration.top+=2;
	if(directionals.jump)
		jumpTime++;
	if(!directionals.jump && !xcontainsy(griffin.STATE, "JUMPING"))
		jumpTime = griffin.floatTime;
	if(directionals.jump && jumpTime < griffin.floatTime){
		griffin.velocity.top += griffin.jumpVelocity;
		if(xcontainsy(griffin.STATE, "LEFT"))
			griffin.STATE = "JUMPINGLEFT";
		if(xcontainsy(griffin.STATE, "RIGHT"))
			griffin.STATE = "JUMPINGRIGHT";
		// jumpTime++;
	}
	if(griffin.velocity.top > 0)
	{
		if(xcontainsy(griffin.STATE, "LEFT"))
			griffin.STATE = "FALLINGLEFT";
		if(xcontainsy(griffin.STATE, "RIGHT"))
			griffin.STATE = "FALLINGRIGHT";
	}


	griffin.velocity.top += griffin.acceleration.top;
	griffin.velocity.left += griffin.acceleration.left;

	if(griffin.velocity.left > griffin.maxRunSpeed){
		griffin.velocity.left = griffin.maxRunSpeed;
	}
	if(griffin.velocity.top > TERMINALVELOCITY){
		griffin.velocity.top = TERMINALVELOCITY;
	}
	if(griffin.velocity.left < -griffin.maxRunSpeed){
		griffin.velocity.left = -griffin.maxRunSpeed;
	}
	// if(griffin.velocity.top < -10){
	// 	griffin.velocity.top = -10;
	// }

	collisionCalc();

	//griffin.velocity.top = griffin.velocity.top*getFriction();
	griffin.velocity.left = griffin.velocity.left*getFriction();

	griffin.acceleration.top = 0;
	griffin.acceleration.left = 0;
};

Game.draw = function() {
	if(debug)
	{
		debugCounter++;
		if(debugCounter > 5){
			debugCounter = 0;
			//console.log("Position: "+position.top+":"+position.left);
		}
	}
	if(debug)
		console.log(griffin.STATE);

	//make griffin happen
	document.getElementById('userBox').style.left = griffin.position.left+"px";
	document.getElementById('userBox').style.top = griffin.position.top+"px";

	for(var k in griffin.bullets)
	{
		if(document.getElementById(k)){
			var e = document.getElementById(k);
			e.style.top = griffin.bullets[k].position.top+"px";
			e.style.left = griffin.bullets[k].position.left+"px";
			e.style.height = griffin.bullets[k].bounds.height+"px";
			e.style.width = griffin.bullets[k].bounds.width+"px";
			// e.style.backgroundColor = "rgb("+griffin.bullets[k].rgb.r+", "+griffin.bullets[k].rgb.g+", "+griffin.bullets[k].rgb.b+")";
			e.style.backgroundColor = "rgb("+getRandomInt(0,255)+", "+getRandomInt(0,255)+", "+getRandomInt(0,255)+")"; //griffin's psychadelic adventure
			// e.style.zIndex = ""+griffin.bullets[k].position.z;
			if(griffin.bullets[k].STATE == "USED"){
				e.parentNode.removeChild(e);
				delete griffin.bullets[k];
			}
		} else {
			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.top = griffin.bullets[k].position.top+"px";
			div.style.left = griffin.bullets[k].position.left+"px";
			div.style.height = griffin.bullets[k].bounds.height+"px";
			div.style.width = griffin.bullets[k].bounds.width+"px";
			div.setAttribute('class', 'griffinbullet');
			div.setAttribute('id', k);
			div.style.backgroundColor = "rgb("+getRandomInt(0,255)+", "+getRandomInt(0,255)+", "+getRandomInt(0,255)+")"; //griffin's psychadelic adventure
			// div.style.backgroundColor = "rgb("+griffin.bullets[k].rgb.r+", "+griffin.bullets[k].rgb.g+", "+griffin.bullets[k].rgb.b+")";
			document.getElementById('world').appendChild(div);
		}
	}

	for(var k in platforms)
	{
		if(document.getElementById(k)){
			var e = document.getElementById(k);
			e.style.top = platforms[k].position.top+"px";
			e.style.left = platforms[k].position.left+"px";
			e.style.height = platforms[k].bounds.height+"px";
			e.style.width = platforms[k].bounds.width+"px";
			// e.style.backgroundColor = "rgb("+platforms[k].rgb.r+", "+platforms[k].rgb.g+", "+platforms[k].rgb.b+")";
			e.style.backgroundColor = "rgb("+getRandomInt(0,255)+", "+getRandomInt(0,255)+", "+getRandomInt(0,255)+")"; //griffin's psychadelic adventure
			e.style.zIndex = ""+platforms[k].position.z;
		} else {
			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.top = platforms[k].position.top+"px";
			div.style.left = platforms[k].position.left+"px";
			div.style.height = platforms[k].bounds.height+"px";
			div.style.width = platforms[k].bounds.width+"px";
			div.setAttribute('class', 'platform');
			div.setAttribute('id', k);
			div.style.backgroundColor = "rgb("+platforms[k].rgb.r+", "+platforms[k].rgb.g+", "+platforms[k].rgb.b+")";
			document.getElementById('world').appendChild(div);
		}
	}

	for(var k in targets)
	{
		if(document.getElementById(k)){
			var e = document.getElementById(k);
			e.style.top = targets[k].position.top+"px";
			e.style.left = targets[k].position.left+"px";
			e.style.height = targets[k].bounds.height+"px";
			e.style.width = targets[k].bounds.width+"px";
			e.style.backgroundColor = "rgb("+targets[k].rgb.r+", "+targets[k].rgb.g+", "+targets[k].rgb.b+")";
			e.style.zIndex = ""+targets[k].position.z;
			if(targets[k].STATE == "HURT"){
				e.style.backgroundColor = "rgb("+getRandomInt(0,255)+", "+getRandomInt(0,255)+", "+getRandomInt(0,255)+")"; //griffin's psychadelic adventure
			}
			else if(targets[k].STATE == "DEAD")
			{
				e.parentNode.removeChild(e);
				delete targets[k];
			}
		} else {
			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.top = targets[k].position.top+"px";
			div.style.left = targets[k].position.left+"px";
			div.style.height = targets[k].bounds.height+"px";
			div.style.width = targets[k].bounds.width+"px";
			div.setAttribute('class', 'target');
			div.setAttribute('id', k);
			div.style.backgroundColor = "rgb("+targets[k].rgb.r+", "+targets[k].rgb.g+", "+targets[k].rgb.b+")";
			document.getElementById('world').appendChild(div);
		}
	}

	for(var p in particleContainer){
		if(document.getElementById(p)){
			var e = document.getElementById(p);
			e.style.top = particleContainer[p].position.top+"px";
			e.style.left = particleContainer[p].position.left+"px";
			e.style.height = particleContainer[p].bounds.height+"px";
			e.style.width = particleContainer[p].bounds.width+"px";
			e.style.backgroundColor = "rgb("+getRandomInt(0,255)+", "+getRandomInt(0,255)+", "+getRandomInt(0,255)+")"; //griffin's psychadelic adventure
			if(particleContainer[p].lifecycle <= 0){
				e.parentNode.removeChild(e);
				delete particleContainer[p];
			}
		} else {
			var div = document.createElement('div');
			div.style.position = "absolute";
			div.style.top = particleContainer[p].position.top+"px";
			div.style.left = particleContainer[p].position.left+"px";
			div.style.height = particleContainer[p].bounds.height+"px";
			div.style.width = particleContainer[p].bounds.width+"px";
			div.setAttribute('class', 'particle');
			div.setAttribute('id', p);
			e.style.backgroundColor = "rgb("+getRandomInt(0,255)+", "+getRandomInt(0,255)+", "+getRandomInt(0,255)+")"; //griffin's psychadelic adventure
			document.getElementById('world').appendChild(div);
		}
	}
};
