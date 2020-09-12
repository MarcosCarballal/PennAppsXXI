const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const session = require('express-session');

// ADD MIDDLEWARE
app.use(express.static('public'));
app.use(session({ secret: 'kazoo' }));

// CONFIGURE GET ROUTES
const getRoutes = require('./routes/get_routes.js');
app.get('/',      getRoutes.getChatTest);
app.get('/home',  getRoutes.getHome);
app.get('/lobby', getRoutes.getLobby);
app.get('/game',  getRoutes.getGame);
app.get('/about', getRoutes.getAbout);

// CONFIGURE POST ROUTES
const postRoutes = require('./routes/post_routes.js');
app.post('/postUserInfo', postRoutes.postUserInfo);

// SOCKET 
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
  	console.log("message:" + msg);
    io.emit('chat message', msg);
  });
});

// LISTEN ON PORT
http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);

module.exports = {
  io: io,
};