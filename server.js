require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let players = [];
let food = [];
var wm = new WeakMap();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const createFood = () => {

  const random = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  let x = random(10, 610);
  let y = random(60, 430);

  return [
    x - x % 10, 
    y - y % 10,
    random(0, 2),
    'food-' + random(100, 1000)
  ];
}
food = createFood();

io.on('connection', socket => { 

  socket.on('new player joined', player => {  
    wm.set(socket, player);
    players.push(player);
    io.emit('gamers updated', {players: players, oldCoordinates: {x: 0, y: 0}});
    io.emit('food coordinates', {food: food, oldCoordinates: {x: 0, y: 0}, players: players});
    console.log('1 new player joined');
  });

  socket.on('player moved', data => {
    players.forEach((p, index) => {
      if(p.id === data.player.id) {
        p.x = data.player.x;
        p.y = data.player.y;
      }
    });
    io.emit('gamers updated', {players: players, oldCoordinates: data.oldCoordinates});
  });

  socket.on('food eaten', playerId => {
    let oldCoordinates = {x: food[0], y: food[1]};
    food = createFood();

    players.forEach((p, index) => {
      if(p.id === playerId) {
        p.score++;
      }
    });

    io.emit(
      'food coordinates', 
      {food: food, oldCoordinates: oldCoordinates, players: players}
    );
  });


  socket.on('disconnect', () => {
    let player = wm.get(socket);
    let index = -1;

    if(player === undefined) return;

    players.forEach((p, index) => {
      if(p.id === player.id) {
        index = p.id;
      }
    });

    players.splice(index, 1);

    console.log(players);

    io.emit('gamers updated', {players: players, oldCoordinates: {x: player.x, y: player.y}});
    io.emit('food coordinates', {food: food, oldCoordinates: {x: player.x, y: player.y}, players: players});
    wm.delete(socket);
  });
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = http.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
