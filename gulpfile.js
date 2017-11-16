  var gulp = require('gulp');

// plugins
  var connect = require('gulp-connect');
  var jshint = require('gulp-jshint');
  var minifyHtml = require('gulp-minify-html');
  var angularTemplatecache = require('gulp-angular-templatecache');
  var del = require('del');
  var useref = require('gulp-useref');
  var concat = require('gulp-concat');
  var ngAnnotate = require('gulp-ng-annotate');
  var uglify = require('gulp-uglify');

// var minifycss = require('gulp-minify-css');
// var clean = require('gulp-clean');
// var runSequence = require('run-sequence');
// var browserify = require('browserify');
// 
// var mainBowerFiles = require('main-bower-files');
// var del = require('del');
// var usemin = require('gulp-usemin');

// var rev = require('gulp-rev');
// var gutil = require('gulp-util');
// var ngAnnotate = require('browserify-ngannotate');
// var sourcemaps = require('gulp-sourcemaps');
// // var sass = require('gulp-sass');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');

// var CacheBuster = require('gulp-cachebust');
// var cachebust = new CacheBuster();

var config = {
  js: 'src/**/*.js',
  html: './src/**/*.html',
  temp: 'temp/'
};

var dist = {
  path: './dist/',
  images: 'images/'
};

// tasks
gulp.task('lint', function() {
  gulp.src(['./src/**/*.js', '!/src/bower_components/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('clean', function(cb) {
  return del([
    'dist'
    ], cb)
});

gulp.task('templatecache', function() {
  return gulp.src(config.html)
    .pipe(minifyHtml({empty: true}))
    .pipe(angularTemplatecache(
      'templates.js', {
        module: 'store',
        standAlone: false,
        root: 'src/'
      }))
    .pipe(gulp.dest(config.temp));
});

gulp.task('useref', ['clean'], function() {
  //var assets = useref.assets();  //this was deprecated in new version v3

  return gulp.src(['./src/index.html','./src/**/*.html'])
    //.pipe(assets)
    //.pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('minifyjs', ['useref','templatecache'], function() {
  return gulp.src(['dist/js/scripts.js', 'temp/templates.js'])
    .pipe(concat('scripts.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('build', ['minifyjs','copy-html-files','connectDist'], function() {
  //del(config.temp);
});

//css
// gulp.task('build-css', ['clean'], function() {
//   return gulp.src(['/src/**/*','!/src/bower_components/**'])
//     .pipe(sourcemaps.init())
//     //.pipe(sass())
//     .pipe(cachebust.resources())
//     .pipe(sourcemaps.write('./maps'))
//     .pipe(gulp.dest('./dist'))
// });

// fills in the Angular template cache, to prevent loading the html templates
// via separate http requests
// gulp.task('build-template-cache', ['clean'], function() {

//   var ngHtml2Js = require("gulp-ng-html2js"),
//       concat = require("gulp-concat");

//   return gulp.src(["/src/**/*.html","!/src/bower_components/**"])
//     .pipe(ngHtml2Js)({
//       moduleName: "storePartials",
//       prefix: "/partials/"
//     })
//     .pipe(concat("templateCachePartials.js"))
//     .pipe(gulp.dest("./dist"));
// });

//---------------------------------------------------
// build a minified Javascript bundle
//---------------------------------------------------
// gulp.task('build-js', ['clean'], function() {
//   var b = browserify({
//     entries: './src/app.js',
//     debug: true,
//     paths: ['./src/**/*.js','!/src/bower_components/**'],
//     transform: [ngAnnotate]
//   });

//   return b.bundle()
//     .pipe(source('bundle.js'))
//     .pipe(buffer())
//     .pipe(cachebust.resources())
//     .pipe(sourcemaps.init({loadMaps: true}))
//     .pipe(uglify())
//     .on('error', gutil.log)
//     .pipe(sourcemaps.write('./'))
//     .pipe(gulp.dest('./dist/js'));
// });

//------------------------------------------------------------------------
// full build; applies cache busting to the main page, css and js bundles
//-------------------------------------------------------------------------
// gulp.task('build', ['clean', 'build-css','lint','build-js','3rdpartybundle','connectDist'], function() {
//   return gulp.src('./src/index.html')
//     .pipe(cachebust.references())
//     .pipe(gulp.dest('./dist'));
// });
// // gulp.task('usemin', function() {
//   return gulp.src('/src/**/*.html')
//     .pipe(usemin({
//       html: [minifyHtml({empty: true, conditionals:true})],
//       js: [uglify(), 'concat', rev()]
//     }))
//     .pipe(gulp.dest('/dist/'));
// });



// gulp.task('minify-css', function() {
//   var opts = {comments:true,spare:true};
//   gulp.src(['./src/**/*.css', '!./src/bower_components/**'])
//     .pipe(minifycss(opts))
//     .pipe(gulp.dest('./dist/'))
// });

// gulp.task('minify-js', function() {
//   gulp.src(['./src/**/*.js', '!./src/bower_components/**'])
//     .pipe(gulp.dest('./dist/'))
// });

// gulp.task('copy-bower-components', function() {
//   gulp.src('./src/bower_components/**')

//     .pipe(gulp.dest('./dist/bower_components'));
// });

gulp.task('copy-html-files', function() {
  gulp.src('src/**/*.html')
    .pipe(gulp.dest('dist/'));
});

// gulp.task('3rdpartybundle', function() {
//   return gulp.src('./bower.json')
//     .pipe(mainBowerFiles( ))
//     .pipe(uglify())
//     .pipe(gulp.dest('./dist/bower_components'));
  // gulp.src(mainBowerFiles())
  //   .pipe(uglify())
  //   .pipe(concat('all.min.js'))
  //   .pipe(gulp.dest('./dist/bower_components'))
//});

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
//gulp.task('default',
 // ['lint', 'connect']);

// gulp.task('build', function() {
//   runSequence(
//   	['clean'],
//   	['lint', 'minify-css', 'minify-js', 
//   	'copy-html-files', 'copy-bower-components', 'connectDist']);
// });

// gulp.task('build', ['clean'], function() {
//   runSequence(['usemin'],['connectDist']);
// });
