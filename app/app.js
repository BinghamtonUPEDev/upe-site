// Set up dependencies
const express = require('express');
const favicon = require('serve-favicon');
const moment = require('moment');
moment().format();

// App configuration
const path = require('path');
const dir = path.resolve(__dirname, '..');
let app = express();
app.set('view engine', 'pug');
app.use(favicon(dir + '/public/favicon.ico'));
app.use('/public', express.static(dir + '/public/'));
app.use('/semantic', express.static(dir + '/node_modules/semantic-ui-css/'));
app.use('/jquery', express.static(dir + '/node_modules/jquery/dist/'));
app.use('/moment', express.static(dir + '/node_modules/moment/min/'));
app.use('/assets', express.static(dir + '/assets/'));
app.use(function(req, res, next) {
    let pathStr = req.path;
    if (req.path.length != 1 && req.path.substr(-1) == '/') {
        pathStr = req.path.substring(0, req.path.length - 1);
    }
    res.locals = { path: pathStr };
    next();
});

// App locals
app.locals.title = 'Upsilon Pi Epsilon';
app.locals.moment = moment;
app.locals.properCase = (str) => str.charAt(0).toUpperCase() + str.substring(1);

// Define navigation
app.locals.navigation = [{
    title: 'Home',
    url: '/'
}, {
    title: 'About',
    url: '/about'
}, {
    title: 'News',
    url: '/news'
}, {
    title: 'Tutoring',
    url: '/tutoring'
}, {
    title: 'Photos',
    url: '/photos'
}, {
    title: 'Contact Us',
    url: '/contact'
}];

// Define EBoard members
app.locals.eboard = [{
    position: 'President',
    name: 'Alexander Strong'
}, {
     position: 'Vice President',
     name: 'Casey Kane'
}, {
     position: 'Secretary',
     name: 'Yu Heng Chen'
}, {
     position: 'Tutoring Coordinator',
     name: 'Taylor Foxhall'
}, {
     position: 'Webmaster',
     name: 'Darrin Frodey'
}];

// Routes
require(dir + '/routes/general')(app);

// Resolve to error page if route not found
app.use(function(req, res) {
    res.render('error', {
        error: true
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log(`Running on localhost:${port}`);
});
