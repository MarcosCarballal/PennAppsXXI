
const getChatTest = (req, res) => {
  console.log(__dirname);
  res.render('index.ejs', {});
}

const getHome = (req, res) => {
	if (req.session.username){
		username = req.session.username
	}else{
		username = "Guest"
	}
  res.render('home.ejs', {'username': username});
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
  postUsername: postUsername,
}

module.exports = routes;