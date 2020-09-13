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
      userInfos: {},
    };
    roomInfo[id] = room;
    roomIds.push(id);
    client.emit('roomCreated', id);
    console.log(`Room [${id}] created by ${userInfo.username}`);
  });
  
  // data = { userInfo: {...}, roomId: ... }
  client.on('joinRoom', (data) => {

    var roomId = data.roomId;
    var newUserId = data.userInfo.userId;
    var newUserInfo = data.userInfo;
    newUserInfo['score'] = 0;
    
    var room = roomInfo[roomId];

    // Update room state // CHECK IF USERNAME CHANGED TODO
    if (!room.userIds.includes(newUserId)) { room.userIds.push(newUserId); }
    if (!room.userInfos[newUserId]) { room.userInfos[newUserId] = newUserInfo; }
    
    socketInfo[client.id] = {
      userId: newUserId,
      roomId: roomId,
    };

    var userInfos = [];
    roomInfo[roomId].userIds.forEach((id) => {
      userInfos.push(roomInfo[roomId].userInfos[id]);
    });

    // Subscribe to the room and tell the others
    client.join(roomId);
    io.to(roomId).emit('userJoined', userInfos);
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
    if (!ids) { return; }

    // Remove user id from list
    console.log('userIds: ' + roomInfo[ids.roomId].userIds);
    // console.log('userIds: ' + type(roomInfo[ids.roomId].userIds));
    
    var tempUserIds = [];
    roomInfo[ids.roomId].userIds.forEach((id) => {
      if (id != ids.userId) {
        tempUserIds.push(id);
      }
    });
    roomInfo[ids.roomId].userIds = tempUserIds;

    var userInfos = [];
    console.log(roomInfo[ids.roomId]);
    roomInfo[ids.roomId].userIds.forEach((id) => {
        userInfos.push(roomInfo[ids.roomId].userInfos[id]);
    });

    io.to(ids.roomId).emit('userLeft', userInfos);
    delete socketInfo[client.id];
  });

});

http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);