
const uuid = require('uuid');

// USERNAME CONSTANTS
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
const ERROR_BAD_USERNAME = 
    `Username must be between ${MIN_USERNAME_LENGTH} and `
  + `${MAX_USERNAME_LENGTH} characters long!`;

// Update/set session information
const postUserInfo = (req, res) => {
  if (!req.body.username ||
      req.body.username.length < MIN_USERNAME_LENGTH ||
      req.body.username.length > MAX_USERNAME_LENGTH) {
    return res.status(400).end();
  }

  const userId = req.session.userId || uuid.v4();
  req.session.username = req.body.username;
  req.session.userId = userId;
  res.status(200).send({ userId: userId });
}

const postCreateRoom = (req, res) => {
  console.log('postCreateRoom');

  console.log(req.session);
  console.log(req.body);

  if (!req.session || !req.body.roomId) {
    return res.redirect('/home');
  }
  res.render('lobby.ejs', {
    username: req.session.username,
    userId: req.session.userId,
    roomId: req.body.roomId,
  });
}

const routes = {
  postUserInfo:   postUserInfo,
  postCreateRoom: postCreateRoom,
};

module.exports = routes;