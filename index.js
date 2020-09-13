const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const session = require('express-session');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const uuid = require('uuid');
const async = require('async');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

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
const { userInfo } = require('os');
app.post('/postUserInfo',   postRoutes.postUserInfo);
app.post('/postCreateRoom', postRoutes.postCreateRoom);
app.post('/postStartGame',  postRoutes.postStartGame);

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

// ROOM CONSTANTS
const ROOM_TTL = 3 * 60 * 60 * 1000;      // 3 hours
const ROOM_DELETER_INTERVAL = 60 * 1000;  // 1 minute
const roomDeleter = setInterval(() => {
  // todo, delete rooms from front of queue
}, ROOM_DELETER_INTERVAL);

// GAME CONSTANTS
const ROUND_LENGTH =        35 * 1000; //  5 seconds
const SHOW_SCORES_LENGTH =   5 * 1000; //  5 seconds
const RAMP_UP_LENGTH =       1 * 1000; //  5 seconds
const HINT_TIMER =          10 * 1000; // 10 seconds
const NUM_ROUNDS =          10;

// SOCKET HANDLERS
io.on('connection', (client) => {
  
  client.on('createRoom', (userInfo) => {
    const id = uuid.v4();
    var room = {
      id: id,
      timeCreated: Date.now(),
      hasStarted: false,
      totalRounds: NUM_ROUNDS,
      currentRound: 1,
      userIds: [],
      userInfos: {},
      lastRoundStartTime: null,
      currentSongName: null,
      currentSongHint: null,
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
    
    // Add game fields
    newUserInfo['score'] = 0;
    newUserInfo['roundScore'] = 0;
    newUserInfo['guessedCorrectly'] = false;
    
    // Update room state // CHECK IF USERNAME CHANGED TODO
    var room = roomInfo[roomId];
    if (!room.userIds.includes(newUserId)) { room.userIds.push(newUserId); }
    if (!room.userInfos[newUserId]) { room.userInfos[newUserId] = newUserInfo; }
    
    // Update socket info
    socketInfo[client.id] = {
      userId: newUserId,
      roomId: roomId,
    };

    // Subscribe to the room and tell the others
    client.join(roomId);
    var userInfos = getUserInfos(roomId);
    io.to(roomId).emit('userJoined', userInfos);
  });

  client.on('startGame', (data) => {
    // Move everyone to the game room
    console.log('startGame');
    const roomId = data.roomId;
    roomInfo[roomId].hasStarted = true;
    io.to(roomId).emit('gameStarted', {});

    // After 5 seconds, kick off the game loop
    runGame(roomId);
  });

  // data = { roomId: ..., userInfo: {...}, message: ... }
  client.on('send', (data) => {
    var userId = data.userInfo.userId;
    var roomId = data.roomId;
    var roomUserInfo = roomInfo[roomId].userInfos[userId];
    if (roomInfo[roomId].currentSongName != null && 
        !roomUserInfo.guessedCorrectly && 
        data.message.toLowerCase().replace(',', '').replace('.', '') === roomInfo[roomId].currentSongName.replace(',', '').replace('.', '')) { // TODO export to equality function
      roomUserInfo.guessedCorrectly = true;
      roomUserInfo.roundScore = ROUND_LENGTH - ((Date.now() - roomInfo[roomId].lastRoundStartTime) / 1000);
    }
    var guessedCorrectly = roomUserInfo.guessedCorrectly;
    io.to(data.roomId).emit('receive', {
      userInfo: data.userInfo,
      message: data.message,
      guessedCorrectly: guessedCorrectly,
    });
  });
  
  client.on('disconnect', () => {
    var ids = socketInfo[client.id]
    if (!ids) { return; }
    
    // Remove user id from room
    var tempUserIds = [];
    roomInfo[ids.roomId].userIds.forEach((id) => {
      if (id != ids.userId) {
        tempUserIds.push(id);
      }
    });
    roomInfo[ids.roomId].userIds = tempUserIds;

    // Update subscribers
    var userInfos = getUserInfos(ids.roomId);
    io.to(ids.roomId).emit('userLeft', userInfos);
    delete socketInfo[client.id];
  });
});

const getUserInfos = (roomId) => {
  var userInfos = [];
  roomInfo[roomId].userIds.forEach((id) => {
      userInfos.push(roomInfo[roomId].userInfos[id]);
  });
  return userInfos;
};

// ===================== //
//  GAME LOOP FUNCTIONS  //
// ===================== //

function getRandomSong() {
  const herokuPrefix = 'https://cors-anywhere.herokuapp.com/';
  const kazooSongsUrl = 'http://storage.googleapis.com/kazuub';

  var songs = ["Africa",
              "Ai_Se_Eu_Te_Pego",
              "Baby",
              "Bohemian_Rhapsody",
              "Candyman",
              "Don't_Start_Now",
              "Fancy",
              "HUMBLE",
              "Never_Gonna_Give_You_Up",
              "The_Sounds_of_Silence",
              ];
    var pickedSongNum = Math.floor(Math.random() * 10);
    var pickedSong = songs[pickedSongNum];
    var pickedSongUrl = herokuPrefix + kazooSongsUrl + "/" + pickedSong + ".mp3";
    return {url: pickedSongUrl, name: pickedSong}; 

  // var xhttp = new XMLHttpRequest();
  // xhttp.onreadystatechange = function() {
  //     if (this.readyState == 4 && this.status == 200) {
  //         // var doc = this.responseXML;
  //         // var songs = doc.getElementsByTagName("Contents");
  //         // var pickedSongNum = Math.floor(Math.random() * 10);
  //         // var pickedSong = songs[pickedSongNum];
  //         // var pickedSongName = pickedSong.getElementsByTagName("Key")[0].childNodes[0].nodeValue;
  //         // var pickedSongUrl = herokuPrefix + kazooSongsUrl + "/" + pickedSongName;

  //         // return {url: pickedSongUrl, name: pickedSongName};
  //     } else {
  //       console.log("status: " + this.status + ", readyState: " + this.readyState);
  //       console.log(this.responseXML);
  //     }
  // };
  // xhttp.open("GET", kazooSongsUrl, true);
  // xhttp.send();
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const updateRoomInfoAfterRound = (roomId) => {
  var userInfo = roomInfo[roomId].userInfo;
  for (var id in userInfo) {
    if (userInfo.hasOwnProperty(id)) {
      userInfo[id]['score'] += userInfo['roundScore'];
      userInfo[id]['roundScore'] = 0;
      userInfo[id]['guessedCorrectly'] = false;
    }
  }
}

const runGame = async (roomId) => {
  console.log('running game...');
  await sleep(RAMP_UP_LENGTH);
  
  while (roomInfo[roomId].currentRound <= NUM_ROUNDS) {
    
    var song = getRandomSong();
    console.log(song);
    var songName = song.name.toLowerCase();
    roomInfo[roomId].currentSongName = songName;
    roomInfo[roomId].currentSongHint = songName.replace(/[^a-z]+/g, "_");;
    
    // TODO
    var songUrl = song.url;
    io.to(roomId).emit('roundStart', { 
      songUrl: songUrl, // client requests song info by url
      roundLength: ROUND_LENGTH,
      roundNumber: roomInfo[roomId].currentRound,
    });
    roomInfo[roomId].lastRoundStartTime = Date.now();
    console.log('round started');

    io.to(roomId).emit('wordBlanks', {
      songHint: roomInfo[roomId].currentSongHint,
    });

    await sleep(ROUND_LENGTH);
    console.log('updating scores');

    io.to(roomId).emit('updateScores', { 
      userInfos: getUserInfos(roomId),
    });

    updateRoomInfoAfterRound(roomId);
    await sleep(SHOW_SCORES_LENGTH);
    roomInfo[roomId].currentRound += 1;
  }

  io.to(roomId).emit('endGame', {});
  // Either remove room id from array or wait for the auto delete ...
  // I'm gonna wait.
};

http.listen(port);
console.log(`Server running on port ${port}. Open http://localhost:${port}/ in browser!`);