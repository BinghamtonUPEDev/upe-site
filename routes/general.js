const fs = require('fs');
const path = require('path');
const async = require('async');

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index');
    });

    app.get('/about', function(req, res) {
        res.render('about');
    });

    app.get('/news', function(req, res) {
        res.render('news');
    });

    app.get('/tutoring', function(req, res) {
        res.render('tutoring');
    });

    app.get('/photos', function(req, res) {
        let tasks = [];
        let getPhotos = function(folder) {
            return function(callback) {
                fs.readdir('assets/img/photos/' + folder,
                    function(error, data) {
                        if (error) return callback(error);

                        let photos = [];
                        for (var i = 0; i < data.length; i++) {
                            if (path.extname(data[i]) === '.jpg') {
                                photos.push(data[i]);
                            }
                        }
                        return callback(null, photos);
                });
            }
        };

        tasks.push(getPhotos('spring17'));
        tasks.push(getPhotos('fall16'));

        async.parallel(tasks, function(err, results) {
            if (err) return res.render('error');

            return res.render('photos', {
                spring17: results[0],
                fall16: results[1]
            });
        });
    });

    app.get('/contact', function(req, res) {
        res.render('contact');
    });
};
