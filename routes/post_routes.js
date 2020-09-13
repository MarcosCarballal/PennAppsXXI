

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
    return res.render('home.ejs', {
      username: null,
      errorBadUsername: ERROR_BAD_USERNAME,
    });
  }

  const username = req.body.username;
  const userId = req.session.userId || uuid();
  req.session = {
    username: req.body.username,
    id: userId,
  };

  res.status(200).end();
}

const routes = {
  postUserInfo: postUserInfo,
};

module.exports = routes;