var gulp = require('gulp');

// plugins
var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');

// tasks
gulp.task('lint', function() {
  gulp.src(['./src/**/*.js', '!./src/bower_components/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('clean', function() {
  gulp.src('./dist/*')
    .pipe(clean({force: true}));
  gulp.src('./app/js/bundled.js')
    .pipe(clean({force: true}));
});

gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src(['./src/**/*.css', '!./src/bower_components/**'])
    .pipe(minifycss(opts))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('minify-js', function() {
  gulp.src(['./src/**/*.js', '!./src/bower_components/**'])
    .pipe(gulp.dest('./dist/'))
});

gulp.task('copy-bower-components', function() {
  gulp.src('./src/bower_components/**')
    .pipe(gulp.dest('/dist/bower_components'));
});

gulp.task('copy-html-files', function() {
  gulp.src('./src/**/*.html')
    .pipe(gulp.dest('/dist'));
});

// gulp.task('browserify', function() {
//   gulp.src(['./src/app.js'])
//     .pipe(browserify({
//       insertGlobals: true,
//       debug: true
//     }))
//     .pipe(concat('bundled.js'))
//     .pipe(gulp.dest('.dist/app/js'))
// });

gulp.task('connect', function() {
  connect.server({
  	root: 'src/',
  	port: 8082
  });
});

gulp.task('connectDist', function() {
  connect.server({
  	root: 'dist/',
  	port: 9999
  });
});

// default task
gulp.task('default',
  ['lint', 'connect']);

gulp.task('build', function() {
  runSequence(
  	['clean'],
  	['lint', 'minify-css', 'minify-js', 
  	'copy-html-files', 'copy-bower-components', 'connectDist']);
});
