/*
This is a gulp script using browserSync and sass with autoprefixer in order to create a more
productive workflow and generating each change automaticaly in the browser without needing to
refresh each time. It also generates the .css files from .sass and prefixes any specific prefixes.
*/

var gulp = require('gulp');
var browserSync = require('browser-sync');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');

gulp.task('site-rebuild', function () {
    browserSync.reload();
});

gulp.task('browser-sync', ['watch'], function() {
    browserSync({
        server: {
            baseDir: 'www'
        },
        notify: false
    });
});

gulp.task('watch', function () {
    gulp.watch(['www/**'], ['site-rebuild']);
});

gulp.task('default', ['browser-sync', 'watch']);
