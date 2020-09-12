io = require('index.js').io

var roomId = null;

io.on('connection', (socket) => {
  socket.on('send chat', sendChat);
  socket.on('update chat', updateChat);
  socket.on('disconnect', )
});

const sendChat = (message, callback) => {
  console.log('message sent: ' + message);
  // send chat ...
  callback();
};

const updateChat = () => {
  // update room chat
};

module.exports = connectionHandler;

/*
io.on("connection", function(socket) {
  var chatID = null;
  console.log("connection!!");

  socket.on('set chatId', (id) => {
    chatID = id;
    socket.join(chatID);
    console.log('GOT THE CHAT ID: ' + chatID)
  });
  
  socket.on("send message", function(sent_msg, callback) {
    console.log(sent_msg[0]);
    //io.sockets.emit("update messages", sent_msg);
    io.to(chatID).emit("update messages", sent_msg);
    callback();
  });
  socket.on("disconnect", function(callback) {
    console.log("disconnected from: ", chatID);
  });
});
*/