import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import {
  PLAYERS,
  COLLECTIBLES
} from './svgs.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const random = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let x = random(10, 610);
let y = random(60, 430);
let speed = 10;
let player = new Player(
  x - x % speed, 
  y - y % speed, 
  0, 
  'player-' + random(1000, 10000)
);

let players = [];
let food = {};

const locateAvatar = (x, y, index) => {
    let i = canvg.Canvg.fromString(
      context, 
      PLAYERS[index], 
      {
        ignoreDimensions: true,
        offsetX: x,
        offsetY: y
      }
    );
    i.start();
    i.stop();
}

const locateFood = (x, y) => {
    let i = canvg.Canvg.fromString(
      context, 
      COLLECTIBLES[random(0, 2)], 
      {
        ignoreDimensions: true,
        offsetX: x,
        offsetY: y
      }
    );
    i.start();
    i.stop();
}

context.strokeStyle = '#FEDB3B';
context.font = '30px Arial';
context.strokeText('Controls: WASD', 20, 30);
context.strokeText('Cookies Game', 250, 30);

context.beginPath();
context.moveTo(10, 50);
context.lineTo(10, 470);
context.lineTo(630, 470);
context.lineTo(630, 50);
context.lineWidth = 1;
context.lineTo(10, 50);
context.strokeStyle = '#054685';
context.stroke();

locateAvatar(player.x, player.y, 0);

//setInterval(() => console.log(player.x + '-' + player.y), 500);

// EVENTS
document.addEventListener('keydown', e => {

  let oldCoordinates = {x: player.x, y: player.y};

  player.movePlayer(e.code, speed);

  if(player.collision(food)) {
    food.x = 0;
    food.y = 0;
    socket.emit('food eaten', player.id);
  }

  socket.emit('player moved', {player: player, oldCoordinates: oldCoordinates});

});

socket.emit('new player joined', player);

socket.on('gamers updated', gamers => {
  players = gamers.players;

  context.clearRect(gamers.oldCoordinates.x, gamers.oldCoordinates.y, 20 ,20);

  players.forEach((p, index) => {
    context.clearRect(p.x, p.y, 20, 20);

    context.fillStyle = 'transparent';
    locateAvatar(p.x, p.y, index);
  });
});

socket.on('food coordinates', object => {
  context.clearRect(object.oldCoordinates.x, object.oldCoordinates.y, 20 ,20);

  players = object.players;
  context.strokeStyle = '#FEDB3B';
  context.clearRect(470, 0, 135, 30);
  context.strokeText('Rank: ' + player.calculateRank(players), 470, 30);

  let collectible = new Collectible(...object.food);

  locateFood(collectible.x, collectible.y);

  food = collectible;
});