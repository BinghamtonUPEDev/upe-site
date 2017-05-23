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
app.locals.moment = moment;
app.locals.path = path;
app.locals.properCase = (str) => str.charAt(0).toUpperCase() + str.substring(1);

/*====================================
 * CUSTOMIZE TITLE
 *
 * This title will appear in the
 * browser tab (<title></title>).
 ====================================*/

app.locals.title = 'UPE Iota Chapter';

/*=== END TITLE CONFIG ===*/

/*====================================
 * CUSTOMIZE NAVIGATION
 *
 * When creating new pages, make sure
 * to add the route here!
 ====================================*/

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

/*=== END NAVIGATION CONFIG ===*/

/*====================================
 * CUSTOMIZE EBOARD MEMBERS & ROLES
 *
 * Add as many roles as applicable.
 * Keep the names updated! Each
 * object needs a position and name.
 ====================================*/

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

/*=== END EBOARD CONFIG ===*/

// Routes
require(dir + '/routes/general')(app);

// Resolve to error page if route not found
app.use(function(req, res) {
    res.render('error', {
        error: true
    });
});

/*====================================
 * EXTEND STATIC SITE GENERATION
 *
 * `npm run generate` adds the
 * required flag to run this code
 * segment and exit when done.
 ====================================*/

if (process.env.COMPILE) {
    // Make async calls to various tasks that make up the static site generator
    const async = require('async');

    // File manipulation (e.g. copying, moving, etc.)
    const fs = require('fs-extra');

    // Include pug (template engine) for rendering html from pug templates
    const pug = require('pug');

    // Update static site navigation to use .html extension
    for (let i = 0; i < app.locals.navigation.length; i++) {
        if (app.locals.navigation[i].url === '/') {
            // '/' equates to home page (index.html)
            app.locals.navigation[i].url = 'index.html';
        } else {
            // Convert a route like "/tutoring" to "tutoring.html"
            // where the slash is removed the ".html" extension is appended
            app.locals.navigation[i].url += '.html';
            app.locals.navigation[i].url = app.locals.navigation[i].url
                .substr(1);
        }
    }

    // Set up a list of tasks to execute in order (async.series)
    let tasks = [];

    // Creates a directory if it doesn't already exist, otherwise proceeds
    let createDir = function(dst) {
        return function(callback) {
            fs.ensureDir(dst, callback);
        };
    };

    // Write a rendered pug template to an html file
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

    // Copies folder or file from src to dst
    let copy = function(src, dst) {
        return function(callback) {
            fs.copy(src, dst, function(err) {
                if (err) return callback(err);
                console.log('✔ Copied ' + src + ' to ' + dst);
                callback(null, true);
            });
        };
    };

    // Sets up pug templates to understand what photos are available.
    // Helps ignore the non .jpg files (e.g. thumbnail storage files, etc.)
    let getPhotos = function(folder) {
        return function(callback) {
            // Walk through photos folder and assess what files are available
            fs.readdir('static/assets/img/photos/' + folder,
                function(error, data) {
                    if (error) return callback(error);

                    let photos = [];
                    for (var i = 0; i < data.length; i++) {
                        if (path.extname(data[i]) === '.jpg') {
                            photos.push(data[i]);
                        }
                    }
                    // Pug templates will now have access to the photos in
                    // place of passing this data using routes if it were
                    // running as a Node.js app
                    app.locals[folder] = photos;
                    return callback(null, photos);
            });
        }
    };

    // Create static folder where the static site lives
    tasks.push(createDir('static'));

    // Create directories for the required packages
    tasks.push(createDir('static/jquery'));     // jQuery
    tasks.push(createDir('static/moment'));     // Moment (time library)
    tasks.push(createDir('static/semantic'));   // Semantic UI CSS/JS

    // Copy over all assets (custom css, js, images, etc.)
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

    // Get all photos for spring 2017 induction
    tasks.push(getPhotos('spring17'));

    // Get all photos for spring 2016 induction
    tasks.push(getPhotos('spring16'));

    // After getting photo data above, write out the photos page
    tasks.push(writeFile('views/photos.pug', 'static/photos.html'));

    // Write out the remaining pages
    tasks.push(writeFile('views/index.pug', 'static/index.html'));
    tasks.push(writeFile('views/about.pug', 'static/about.html'));
    tasks.push(writeFile('views/news.pug', 'static/news.html'));
    tasks.push(writeFile('views/tutoring.pug', 'static/tutoring.html'));
    tasks.push(writeFile('views/contact.pug', 'static/contact.html'));

    // Execute the tasks we've set up above in order (async.series)
    async.series(tasks, function(err, results) {
        // If an error occurred, then print out a warning followed by the error
        if (err) {
            console.log('\nError generating static site\n');
            console.log(err);
            process.exit(1);
        }

        // If no errors occurred, print out a success message
        console.log('\nGenerated static site successfully');
        process.exit(0);
    });

/*=== END STATIC SITE GENERATION SEGMENT ===*/

} else {
    const port = process.env.PORT || 3000;
    app.listen(port, function() {
        console.log(`Running on 127.0.0.1:${port}`);
    });
}
