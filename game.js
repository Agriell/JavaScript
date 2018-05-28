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
		  	)}
	}
	times (factor) {
		return new Vector(
      	this.x * factor,
	   	this.y * factor
		)}
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
	get left() {return this.pos.x;}
	get top() {return this.pos.y;}
	get right() {return this.pos.x + this.size.x;}
	get bottom() {return this.pos.y + this.size.y;}
	get type() {return 'actor';}
	
	isIntersect(object) {
		if (object instanceof Actor) {
			if (object === this) {return false}
			else if (
				object.left == this.left &&
				object.right == this.right &&
				object.top == this.top &&
				object.bottom == this.bottom
				) {return true}
			else if (
				object.left == this.right ||
				object.right == this.left ||
				object.top == this.bottom ||
				object.bottom == this.top
			) {return false}
			else if (
				object.left < this.right && object.left > this.left ||
				object.right > this.left && object.right < this.right ||
				object.top < this.bottom && object.top > this.top ||
				object.bottom > this.top && object.bottom < this.bottom
			) {return true}
			else {return false}
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
			this.player = this.actors.find(
				elem => {
					if (elem['type'] === 'player') 
						{return elem}
				})
		}
		this.status = null;
		this.finishDelay = 1;
		if (this.grid !== []) {
			this.height = this.grid.length;
			this.width = this.grid.map(item => item.length)
				.reduce(function(prev, cur) {
      			if (cur > prev) {return cur}
     				else {return prev}
  				}, 0)
		} else {
			this.width = 0
			this.height = 0
		}
	}
	isFinished() {
		if (this.status !== null && this.finishDelay < 0) {
			return true;
		} else {return false}
	}
	actorAt (object) {
		if (object instanceof Actor) {
			return this.actors.find(elem => elem.isIntersect(object))
		} else {
			throw new Error('Принимает только объекты класса Actor.')
		}
	}
	obstacleAt(position, size) {
		if (!(position instanceof Vector ||
			 size instanceof Vector)) {
			throw new Error('Принимает только объекты класса Vector.')
		} else {
			if (
				position.x < 0 ||
				position.y < 0 ||
				position.x + size.x > this.width) {
				return 'wall'
			}
			else if (
				position.y + size.y > this.height) {
				return 'lava'
			}
			else {
				for (let i = Math.floor(position.y); i < Math.ceil(position.y + size.y); i++) {
					for (let j = Math.floor(position.x); j < Math.ceil(position.x + size.x); j++) {
						if(this.grid[i][j]) return this.grid[i][j]
					}
				}
			}
			
		}
	}
	removeActor(object) {
		if (~this.actors.indexOf(object)) {
			this.actors.findIndex(
				function(elem, index, array) {
					if (elem === object) {
						array.splice(index, 1)
					}
				})
		}
	}
	noMoreActors(type) {
		if (this.actors.length == 0) return true;
		if (this.actors.find(
				elem => elem['type'] === type
			)) {return false}
		else return true
	}
	playerTouched(type, object) {
		if (this.status !== 'null') {
			if (  
				type === 'lava' || 
				type === 'fireball') {
					this.status = 'lost';
			} else if (type === 'coin' && object) {
				this.removeActor(object)
				if (this.noMoreActors('coin')) {
					this.status = 'won'
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
				return this.vocab[symbol]
			} else return undefined
		} else return undefined
	}
	obstacleFromSymbol(symbol) {
		if (symbol === 'x') return 'wall'
		else if (symbol === '!') return 'lava'
		else return undefined
	}
	createGrid(plan) {
		if (plan.length == 0) {return []};
		let grid = [];
		for (let i = 0; i < plan.length; i++) {
			let gridString = [];
			for (let j = 0; j < plan[i].length; j++) {
				gridString.push(this.obstacleFromSymbol(plan[i][j]));
			}
			grid.push(gridString);
		}
		return grid;
	}
	createActors(actorsList) {
		const actorsArr = [];
		if (actorsList.length === 0) return actorsArr;
		if (!this.vocab) {return actorsArr};
		actorsList.forEach((value, index, array) => {
				for (let i = 0; i < value.length; i++) {
					if (typeof this.vocab[value[i]] === 'function')	{
						let Elem = Object(this.vocab[value[i]]),
						// let Elem = Object(this.actorFromSymbol(value[i])),
						
							actor = new Elem(new Vector(i, index))
						if (actor instanceof Actor) {
							actorsArr.push(actor)	
							// actorsArr.push(new actorFromSymbol(value[i])(new Vector(i, index)))
						}
					}
				}
			})
		return actorsArr;
	}
	parse(arrayStr) {
		const gridObj = this.createGrid(arrayStr),
			  gridAct = this.createActors(arrayStr);
		return new Level(gridObj, gridAct)
	}
}





























