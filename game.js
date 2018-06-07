'use strict';


class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(object) {
		if (!(object instanceof Vector)) {
			throw new Error('Можно прибавлять к вектору только вектор типа Vector.');
		} else {
			return new Vector(
	     	this.x + object.x,
       	this.y + object.y
		  );
		}
	}

	times(factor) {
		return new Vector(
      this.x * factor,
	   	this.y * factor
		);
	}
}


class Actor {
	constructor(
		pos = new Vector(0, 0),
		size = new Vector(1, 1),
		speed = new Vector(0, 0)) {
		if (!(pos instanceof Vector) ||
			!(size instanceof Vector) ||
			!(speed instanceof Vector)) {
				throw new Error('Может принимать только объекты типа Vector.');
		} else {
			this.pos = pos;
			this.size = size;
			this.speed = speed;
		}}

	act() {}

	get left() {
		return this.pos.x;
	}
	
	get top() {
		return this.pos.y;
	}
	
	get right() {
		return this.pos.x + this.size.x;
	}
	
	get bottom() {
		return this.pos.y + this.size.y;
	}

	get type() {
		return 'actor';
	}
	
	isIntersect(object) {
		if (object instanceof Actor) {
			if (object === this) {
				return false;
			}	else if (object.left >= this.right) {
				return false;
			}	else if (object.right <= this.left) {
				return false;
			}	else if (object.top >= this.bottom) {
				return false;
			}	else if (object.bottom <= this.top) {
				return false;
			}	else {
				return true;
			}
		} else {
			throw new Error('Может принимать только объекты типа Actor.');
		}
	}
}


class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		
		if (this.actors) {
			this.player = this.actors.find(elem => {
				if (elem.type === 'player') {
					return elem;
				}
			});
		}
		
		this.status = null;
		this.finishDelay = 1;
		
		if (this.grid.length) {
			this.height = this.grid.length;
			this.width = Math.max.apply(null, this.grid.map(item => item.length));
		} else {
			this.width = 0;
			this.height = 0;
		}
	}

	isFinished() {
		if (this.status !== null && this.finishDelay < 0) {
			return true;
		} else {
			return false;
		}
	}

	actorAt (object) {
		if (object instanceof Actor) {
			return this.actors.find(
				elem => elem.isIntersect(object)
			);
		} else {
			throw new Error('Принимает только объекты класса Actor.');
		}
	}

	obstacleAt(position, size) {
		if (!(position instanceof Vector ||
			size instanceof Vector)) {
			throw new Error('Принимает только объекты класса Vector.');
		} else {
			if (position.x < 0 ||
				position.y < 0 ||
				position.x + size.x > this.width) {
					return 'wall';
			}	else if (position.y + size.y > this.height) {
				return 'lava';
			}	else {
				for (let i = Math.floor(position.y);
						 i < Math.ceil(position.y + size.y);
						 i++) {
					for (let j = Math.floor(position.x);
							 j < Math.ceil(position.x + size.x);
							 j++) {
						let node = this.grid[i][j];
						if(node) {
							return node;
						}
					}
				}
			}
		}
	}

	removeActor(object) {
		if (this.actors.indexOf(object) !== -1) {
			this.actors.findIndex(function(elem, index, array) {
				if (elem === object) {
					array.splice(index, 1);
				}
			});
		}
	}

	noMoreActors(type) {
		if (this.actors.length === 0) {
			return true;
		}
		if (this.actors.find(elem => elem.type === type)) {
			return false;
		}	else {
			return true;
		}
	}

	playerTouched(type, object) {
		if (this.status !== 'null') {
			if ( type === 'lava' || 
				type === 'fireball') {
					this.status = 'lost';
			} else if (type === 'coin' && object) {
				this.removeActor(object);
				if (this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}
		}
	}
}


class LevelParser {
	constructor(vocab) {
		this.vocab = vocab;
	}
	
	actorFromSymbol(symbol) {
		if (symbol) {
			if (symbol in this.vocab) {
				return this.vocab[symbol];
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	}

	obstacleFromSymbol(symbol) {
		if (symbol === 'x') {
			return 'wall';
		}	else if (symbol === '!') {
			return 'lava';
		}	else {
			return undefined;
		}
	}

	createGrid(plan) {
		if (plan.length === 0) {
			return [];
		}
		let grid = [];
		for (let str of plan) {
			let gridString = [];
			for (let sym of str) {
				gridString.push(this.obstacleFromSymbol(sym));
			}
			grid.push(gridString);
		}
		return grid;
	}

	createActors(actorsList) {
		const actorsArr = [];
		if (actorsList.length === 0) {
			return actorsArr;
		}
		if (!this.vocab) {
			return actorsArr;
		}

		actorsList.forEach((value, index) => {
			for (let i = 0; i < value.length; i++) {
				if (typeof this.vocab[value[i]] === 'function')	{
					let Elem = Object(this.vocab[value[i]]);
					let actor = new Elem(new Vector(i, index));
					if (actor instanceof Actor) {
						actorsArr.push(actor);
					}
				}
			}
		});
		return actorsArr;
	}

	parse(arrayStr) {
		const gridObj = this.createGrid(arrayStr),
			  	gridAct = this.createActors(arrayStr);
		return new Level(gridObj, gridAct);
	}
}

class Fireball extends Actor {
	constructor(
		pos = new Vector(0, 0),
		speed = new Vector(0, 0)) {
			super(pos);
			this.speed = speed;
			this.size = new Vector(1, 1);
	}

	get type() {
		return 'fireball';
	}

	getNextPosition(time = 1) {
		let newPos = new Vector(this.pos.x, this.pos.y);
		return newPos.plus(this.speed.times(time));
	}

	handleObstacle() {
		this.speed = this.speed.times(-1);
	}

	act(time, playField) {
		const nextPosition = this.getNextPosition(time);
		if (!playField.obstacleAt(nextPosition, this.size)) {
			this.pos = nextPosition;
		} else {
			this.handleObstacle();
		}
	}
}


class HorizontalFireball extends Fireball {
	constructor(pos) {
		super(pos);
		this.size = new Vector(1, 1);
		this.speed = new Vector(2, 0);
	}
}

class VerticalFireball extends Fireball {
	constructor(pos) {
	  super(pos);
	  this.size = new Vector(1, 1);
	  this.speed = new Vector(0, 2);
	}
}

class FireRain extends Fireball {
	constructor(pos) {
	   super(pos);
	   this.startPos = pos;
	   this.size = new Vector(1, 1);
	   this.speed = new Vector(0, 3);
	}
	handleObstacle() {
		this.pos = this.startPos;
	}
}

class Coin extends Actor {
	constructor(pos) {
		super(pos);
		this.basePos = this.pos;
		this.pos = this.pos.plus(new Vector(0.2, 0.1));
		this.size = new Vector(0.6, 0.6);
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * Math.PI * 2; 
	}
	
	get type() {
		return 'coin';
	}
	
	updateSpring(time = 1) {
		this.spring += this.springSpeed * time;
	}
	
	getSpringVector() {
		return new Vector(0, this.springDist * Math.sin(this.spring));
	}

	getNextPosition(time = 1) {
		this.updateSpring(time);
		return this.basePos
					.plus(this.getSpringVector())
					.plus(new Vector(0.2, 0.1));
	}

	act(time) {
		this.pos = this.getNextPosition(time);
	}
}

class Player extends Actor {
	constructor(pos) {
		super(pos);
		this.basePos = this.pos;
		this.pos = this.pos.plus(new Vector(0, -0.5));
		this.size = new Vector(0.8, 1.5);
		this.speed = new Vector(0, 0);
	}

	get type() {
		return 'player';
	}
}


// const schemas = [
//   [
//     '                           ',
//     '              o          o ',
//     '          v        | xxxxx ',
//     '       o   xxxxxx          ',
//     '      xxx             x    ',
//     ' @o    x    =              ',
//     'xxx!             xxxxx     ',
//     '                           '
//   ],
//   [
//     '      v  ',
//     '    o    ',
//     '  v     o',
//     '        x',
//     '         ',
//     '@   x   o',
//     'x       x',
//     '         '
//   ]
// ];

const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball

};
const parser = new LevelParser(actorDict);

loadLevels()
	.then((res) => JSON.parse(res))
	.then((result) => {
		runGame(result, parser, DOMDisplay)
  .then(() => alert('Вы выиграли! УРА!'));
});













