const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const session = require('express-session');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const uuid = require('uuid');

// ADD MIDDLEWARE
app.use(express.static('public'));
app.use(session({ secret: 'kazoo' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CONFIGURE GET ROUTES
const getRoutes = require('./routes/get_routes.js');
app.get('/',      getRoutes.getHome);
app.get('/home',  getRoutes.getHome);
app.get('/lobby', getRoutes.getLobby);
app.get('/game',  getRoutes.getGame);
app.get('/about', getRoutes.getAbout);

// CONFIGURE POST ROUTES
const postRoutes = require('./routes/post_routes.js');
app.post('/postUserInfo',   postRoutes.postUserInfo);
app.post('/postCreateRoom', postRoutes.postCreateRoom);

// ROOM STATE
roomIds = [];
roomInfo = {};
socketInfo = {};
// userIds
// userInfo
// timeCreated
// usersBySocketIds
// ...
// ...

const ROOM_TTL = 3 * 60 * 60 * 1000;      // 3 hours
const ROOM_DELETER_INTERVAL = 60 * 1000;  // 1 minute
const roomDeleter = setInterval(() => {
  // todo, delete rooms from front of queue
}, ROOM_DELETER_INTERVAL);

// SOCKET HANDLERS
io.on('connection', (client) => {
  
  client.on('createRoom', (userInfo) => {
    const id = uuid.v4();
    var room = {
      id: id,
      timeCreated: Date.now(),
      hasStarted: false,
      userIds: [],
      userScores: {},
    };
    roomInfo[id] = room;
    roomIds.push(id);
    client.emit('roomCreated', id);
    console.log(`Room [${id}] created by ${userInfo.username}`);
  });
  
  // data = { userInfo: {...}, roomId: ... }
  client.on('joinRoom', (data) => {

    // Update room state
    var roomId = data.roomId;
    var room = roomInfo[roomId];
    var userIds = room.userIds;
    var userInfo = room.userInfo;
    var userScores = room.userScores;
    var userId = userInfo.userId;

    if (!userIds.includes(userId)) { userIds.push(userId); }
    if (!userInfo[userId]) { userInfo[userId] = userInfo; }
    if (!userScores[userId]) { userScores[userId] = 0; }
    
    socketInfo[client.id] = {
      userId: userId,
      roomId: roomId,
    };

    // subscribe to the room
    client.join(roomId);
    client.to(roomId).emit('userJoined', {
      username: username,
      score: userScores[userId],
      // TODO: add avatar
    });
  });

  client.on('startGame', function(game_id){
  	// todo, move from lobby to game
  });

  // data = { roomId: ..., userInfo: {...}, message: ... }
  client.on('send', (data) => {
    // todo: check if correct
    console.log(data);
    io.to(data.roomId).emit('receive', {
      userInfo: data.userInfo,
      message: data.message,
    });
  });
  
  client.on('disconnect', () => {
    var ids = socketInfo[client.id]
    client.to(ids.roomId).emit('userLeft', { userId: userId });
    delete socketInfo[client.id];
  });

});

http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);