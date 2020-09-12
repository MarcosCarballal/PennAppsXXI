
const getChatTest = (req, res) => {
  console.log(__dirname);
  res.render('index.ejs', {});
}

const getHome = (req, res) => {
  res.render('home.ejs', {});
}

const getLobby = (req, res) => {
  res.render('lobby.ejs', {});
}

const getGame = (req, res) => {
  res.render('game.ejs', {});
}

const routes = {
  getChatTest: getChatTest,
  getHome: getHome,
  getLobby: getLobby,
  getGame: getGame,
}

module.exports = routes;