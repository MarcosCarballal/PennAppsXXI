const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const session = require('express-session');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// ADD MIDDLEWARE
app.use(express.static('public'));
app.use(session({ secret: 'kazoo' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); //  Not sure if we need cookies

playerDict = {}

// CONFIGURE GET ROUTES
const getRoutes = require('./routes/get_routes.js');
app.get('/',      getRoutes.getHome);
app.get('/home',  getRoutes.getHome);
app.get('/lobby', getRoutes.getLobby);
app.get('/game',  getRoutes.getGame);
app.get('/about', getRoutes.getAbout);

// CONFIGURE POST ROUTES
const postRoutes = require('./routes/post_routes.js');
app.post('/postUserInfo', postRoutes.postUserInfo);

// SOCKET 

currentSongTitle = ""
roomCounter = 1


io.on('connection', function(socket){
	if(!playerDict[socket.id]){
		playerDict[socket.id] = "Chad_" + socket.id
	}


  socket.on('createRoom', function(){
   	// Make socket room/lobby
  	// Add maker's socket to room
  	// Send back Game ID
  	// Emit back to client the page to navigate to
  	game_id = roomCounter
  	socket.join(game_id)
  	roomCounter = roomCounter + 1
  	console.log("Created room with id " + game_id)
  	io.to(socket.id).emit('game_id',game_id)// respond only to sender
  });
  socket.on('joinGame', function(game_id){
  	// Add socket to room
  	// Emit back to client the page to navigate to
  	// Bind the socket_id to the user registered under cookies.
  })
  socket.on('startGame', function(game_id){
  	console.log("Staring the game with game_id:" + str(game_id))
  	// Emit all players a link to game for the cleint to navigate to
  	// Start the game loop
  	// while(maxscore < 10){
  	// 	asdasdl
  	// 	asdased
  	// 	currentSongTitle = "Shakira's song"
  	// }
  });
  socket.on('guess', function(guess){
  	console.log("message:" + guess);
  	// Determine the room that socker id belongs to.
  	// Emit this value to the socket of all players
    io.emit('annouceGuess', playerDict[socket.id] + " guessed:" + guess);
  });
  socket.on('disconnect',function(){
  	console.log("socket with ID " + socket.id + " disconnected")
  	// emit to all players in room that the player disconnected.
  });
});

//GAME LOOP
function startGame() {
  const numRounds = 3;
  var round = 0;
  while (round < numRounds) {
    //getSong();
    //playSong();
    //wait for players to answer or time to run out
    //increment scores
    round++;
  }
}

http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);

module.exports = {
  io: io,
};