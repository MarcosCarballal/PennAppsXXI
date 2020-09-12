
const getHome = (req, res) => {
  res.render('main.ejs', {});
}

const getLobby = (req, res) => {
  res.render('lobby.ejs', {});
}

const getGame = (req, res) => {
  res.render('game.ejs', {});
}

const routes = {
  
}

module.exports = routes;