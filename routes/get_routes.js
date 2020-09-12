
const getChatTest = (req, res) => {
  res.render('index.ejs', {});
}

const getHome = (req, res) => {
  res.render('home.ejs', {
    errorBadUsername: null,
  });
}

const getLobby = (req, res) => {
  res.render('lobby.ejs', {});
}

const getGame = (req, res) => {
  res.render('game.ejs', {});
}

const getAbout = (req, res) => {
  res.render('about.ejs', {});
}

const routes = {
  getChatTest:  getChatTest,
  getHome:      getHome,
  getLobby:     getLobby,
  getGame:      getGame,
  getAbout:     getAbout,
}

module.exports = routes;