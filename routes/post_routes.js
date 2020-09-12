
const postUserInfo = (req, res) => {
	console.log(req.body.username + " was added as a user")
	req.session.username = req.body.username
	res.render('home.ejs', {'username': req.body.username})
}

const routes = {
  postUserInfo: postUserInfo,
};

module.exports = routes;