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
				for (let i = Math.floor(position.x); i <= Math.floor(position.x + size.x); i++) {
					for (let j = Math.floor(position.y); j <= Math.floor(position.y + size.y); j++) {
						return this.grid[i][j]
					}
				}
			}
			
		}
	}


}





















