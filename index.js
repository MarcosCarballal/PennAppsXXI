var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

// express imports
app.use(express.static('public'));
// app.use(express.bodyParser());
// app.use(express.cookieParser()); //  Not sure if we need cookies
// app.use(express.session({ secret: "pass" }));

// importing routes
var routes = require('./routes/routes.js');

app.get('/',      routes.getChatTest);
app.get('/home',  routes.getHome);
app.get('/lobby', routes.getLobby);
app.get('/game',  routes.getGame);
app.get('/about', routes.getAbout);

// SOCKET
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
  	console.log("message:" + msg);
    io.emit('chat message', msg);
  });
});

http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);