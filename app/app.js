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
app.locals.path = path;
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
    name: 'Aiden Cullo'
}, {
     position: 'Vice President',
     name: 'Zachary Halpern'
}, {
     position: 'Secretary',
     name: 'Melanie Chen'
}, {
     position: 'Treasurer',
     name: 'Julie Kunnumpurath'
}, {
     position: 'Tutoring Coordinator',
     name: 'Johnathon Van Atta'
}, {
     position: 'Webmaster',
     name: 'Juliana Algava'
}, {
     position: 'Events Coordinator',
     name: 'Josiah Bailey'
}];

// Routes
require(dir + '/routes/general')(app);

// Resolve to error page if route not found
app.use(function(req, res) {
    res.render('error', {
        error: true
    });
});

if (process.env.COMPILE) {
    const async = require('async');
    const fs = require('fs-extra');
    const pug = require('pug');

    for (let i = 0; i < app.locals.navigation.length; i++) {
        if (app.locals.navigation[i].url === '/') {
            app.locals.navigation[i].url = 'index.html';
        } else {
            app.locals.navigation[i].url += '.html';
            app.locals.navigation[i].url = app.locals.navigation[i].url
                .substr(1);
        }
    }

    let tasks = [];

    let createDir = function(dir) {
        return function(callback) {
            fs.ensureDir(dir, callback);
        };
    };

    let writeFile = function(src, dst) {
        return function(callback) {
            let html = pug.renderFile(src, app.locals);
            html = html.replace(/href="\/(\w+)"/, 'href="$1.html"');
            fs.writeFile(dst, html, function(err) {
                if(err) {
                    console.log(err);
                    return callback(err);
                }

                console.log('✔ Saved to ' + dst);
                return callback(null, true);
            });
        }
    };

    let copy = function(src, dst) {
        return function(callback) {
            fs.copy(src, dst, function(err) {
                if (err) return callback(err);
                console.log('✔ Copied ' + src + ' to ' + dst);
                callback(null, true);
            });
        };
    };

    let getPhotos = function(folder) {
        return function(callback) {
            fs.readdir('static/assets/img/photos/' + folder,
                function(error, data) {
                    if (error) return callback(error);

                    let photos = [];
                    for (var i = 0; i < data.length; i++) {
                        if (path.extname(data[i]) === '.jpg') {
                            photos.push(data[i]);
                        }
                    }
                    app.locals[folder] = photos;
                    return callback(null, photos);
            });
        }
    };

    tasks.push(createDir('static'));
    tasks.push(createDir('static/jquery'));
    tasks.push(createDir('static/moment'));
    tasks.push(createDir('static/semantic'));

    tasks.push(copy('assets', 'static/assets'));
    tasks.push(copy('node_modules/jquery/dist/jquery.min.js',
        'static/jquery/jquery.min.js'));
    tasks.push(copy('node_modules/moment/min/moment.min.js',
        'static/moment/moment.min.js'));
    tasks.push(copy('node_modules/semantic-ui-css/semantic.min.css',
        'static/semantic/semantic.min.css'));
    tasks.push(copy('node_modules/semantic-ui-css/semantic.min.js',
        'static/semantic/semantic.min.js'));
    tasks.push(copy('node_modules/semantic-ui-css/themes',
        'static/semantic/themes'));
    tasks.push(copy('public/', 'static/public'));

    tasks.push(getPhotos('spring17'));
    tasks.push(getPhotos('spring16'));
    tasks.push(writeFile('views/photos.pug', 'static/photos.html'));

    tasks.push(writeFile('views/index.pug', 'static/index.html'));
    tasks.push(writeFile('views/about.pug', 'static/about.html'));
    tasks.push(writeFile('views/news.pug', 'static/news.html'));
    tasks.push(writeFile('views/tutoring.pug', 'static/tutoring.html'));
    tasks.push(writeFile('views/contact.pug', 'static/contact.html'));

    async.series(tasks, function(err, results) {
        if (err) {
            console.log('\nError generating static site');
            process.exit(1);
        }

        console.log('\nGenerated static site successfully');
        process.exit(0);
    });
} else {
    const port = process.env.PORT || 3000;
    app.listen(port, function() {
        console.log(`Running on localhost:${port}`);
    });
}
