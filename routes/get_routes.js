
const uuid = require('uuid');

const getHome = (req, res) => {
  res.render('home.ejs', {
    username: req.session.username || '',
    errorBadUsername: null,
    errorNoRoomId: null,
  });
}

const ERROR_NO_ROOM_ID = `No room code entered!`;
const getLobby = (req, res) => {
  if (!req.session) {
    return res.redirect('/home');
  }
  if (!req.body.roomId) {
    return res.render('home.ejs', {
      username: null,
      errorBadUsername: null,
      errorNoRoomId: ERROR_NO_ROOM_ID,
    });
  }
  res.render('lobby.ejs', {
    username: username,
    userId: userId,
    roomId: roomId,
  });
}

const getGame = (req, res) => {
  res.render('game.ejs', {
    username: "Riley",
    userId: "rileys_id",
    roomId: "322",
  });
}

const getAbout = (req, res) => {
  res.render('about.ejs', {});
}

const routes = {
  getHome:  getHome,
  getLobby: getLobby,
  getGame:  getGame,
  getAbout: getAbout,
}

module.exports = routes;