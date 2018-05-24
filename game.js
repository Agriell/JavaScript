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
			this.grid = 0
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

}

const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);




























