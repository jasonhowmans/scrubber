'use strict';

var gulp        = require('gulp');
var sass        = require('gulp-sass');
var autoprefix  = require('gulp-autoprefixer');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');

gulp.task('scrubber', function() {
  return gulp.src('./lib/scrubber.js')
             .pipe( uglify() )
             .pipe( jshint() )
             .pipe( gulp.dest('./dist') );
});

gulp.task('watch', function() {
  gulp.watch('./lib/**/*.js', ['scrubber']);
})

gulp.task('default', ['scrubber', 'watch']);