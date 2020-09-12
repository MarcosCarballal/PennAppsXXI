var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// express imports
app.use(express.static('public'));
app.use(express.bodyParser());
// app.use(express.logger("default"));
app.use(express.cookieParser());
app.use(express.session({ secret: "pass" }));

// importing routes
var routes = require('./routes/routes.js');
var dbRoutes = require('./routes/db_routes.js');

// routes
app.get('/', routes.getMain);
app.get('/lobby', routes.);
app.get('game', )

const port = 8080;
http.listen(port);
console.log(`Server running on port ${port}. Now open http://localhost:${port}/ in your browser!`);