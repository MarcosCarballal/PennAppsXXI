var session = require('express-session')
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

playerDict = {}

// express imports
app.use(session({
	secret: 'secret'
}))
app.use(express.static('public'));
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); //  Not sure if we need cookies
// app.use(express.session({ secret: "pass" }));

// importing routes
var routes = require('./routes/routes.js');

app.get('/',      routes.getChatTest);
app.get('/home',  routes.getHome);
app.get('/lobby', routes.getLobby);
app.get('/game',  routes.getGame);
app.get('/about', routes.getAbout);
app.use('/postUsername', routes.postUsername)

// SOCKET
io.on('connection', function(socket){
	if(!playerDict[socket.id]){
		playerDict[socket.id] = "Chad_" + socket.id
	}
  socket.on('chat message', function(msg){
  	console.log("message:" + msg);
    io.emit('chat message', playerDict[socket.id] + " guessed:" + msg);
  });
});

http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);