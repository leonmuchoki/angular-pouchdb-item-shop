var gulp = require('gulp');

var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('gulp-main-bower-files');
var Q = require('q');
var connect = require('gulp-connect');
var bowerNormalizer = require('gulp-bower-normalize');
var uglifyjs = require('uglify-js'); // latest uglify to support es6
var webpack = require('webpack-stream');
var streamqueue = require('streamqueue');
var runSequence = require('run-sequence');

var paths = {
  scripts:       [
                  'src/app.js',
                  'src/cache-polyfill.js',
                  'src/creditors/creditor.controller.js',
                  'src/items/item.controller.js',
                  'src/nav/navComponent.js',
                  'src/nav/sideBarComponent.js',
                  'src/sales/sales.controller.js',
                  'src/services/pouchdb_service.js',
                  '!/src/index.html','!src/**/*.html','!src/**/*.css','!src/bower_components/**/*'
                  ],
  styles:        ['./src/**/*.css', './src/**/*.scss','!./src/bower_components/**/*'],
  index:         './src/index.html',
  partials:       ['./src/**/*.html', '!.src/index.html','!./src/bower_components/**/*'],
  favicons:       'src/favicons/*.png',
  distDev:   	  './dist.dev',
  distProd:        './dist/dist.prod',
  distScriptsProd: './dist/dist.prod/scripts'
};

//=======PIPE SEGMENTS=========

var pipes = {};

pipes.orderedVendorScripts = function() {
  return plugins.order([
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/moment/moment.js',
                        'bower_components/angular/angular.js',
                        'bower_components/angular-animate/angular-animate.js',
                        'bower_components/angular-aria/angular-aria.js',
                        'bower_components/angular-material/angular-material.js',
                        'bower_components/angular-messages/angular-messages.js',
                        'bower_components/bootstrap/dist/js/bootstrap.js'
                        ], 
                        {base: './dist.dev'}
                      );
};

pipes.orderedAppScripts = function() {
  return plugins.angularFilesort();
};

pipes.minifiedFileName = function() {
  return plugins.rename(function(path) {
  	path.extname = '.min' + path.extname;
  });
};

pipes.validatedAppScripts = function() {
  return gulp.src(paths.scripts)
      .pipe(plugins.jshint())
      .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScriptsDev = function() {
  return pipes.validatedAppScripts()
      .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
  var scriptedPartials = pipes.scriptedPartials();
  var validatedAppScripts = pipes.validatedAppScripts();

  return es.merge(validatedAppScripts,scriptedPartials)//gulp.src(paths.scripts)//es.merge(validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        //.pipe(plugins.sourcemaps.init())
          .pipe(plugins.concat('app.min.js'))
          //.pipe(plugins.uglify())
        //.pipe(plugins.sourcemaps.write())
       .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsDev = function() {
  return gulp.src('./bower.json')
      .pipe(bowerFiles( ))
      //.pipe(pipes.orderedVendorScripts())
      .pipe(gulp.dest('dist.dev/bower_components'));
};

pipes.builtVendorScriptsProd = function() {
  return gulp.src('./bower.json')//gulp.src(bowerFiles('src/bower_components/**/*.js'), {base: "src/bower_components"})
      .pipe(bowerFiles('**/*.js'))
      .pipe(pipes.orderedVendorScripts())
      //.pipe(bowerNormalizer({bowerJson: './bower.json'}))
      .pipe(plugins.concat('vendor.min.js'))
      //.pipe(plugins.ngAnnotate())
      //.pipe(plugins.uglify())
           //.pipe(webpack())
      //.pipe(plugins.uglifyJs())
       .on('error', function(err) { 
       	                        plugins.util.log(plugins.util.colors.red('[Error]'), err.toString()); 
       	                        })
      .pipe(gulp.dest(paths.distScriptsProd));
};

// fonts
pipes.builtBootstrapFontsDev = function() {
  return gulp.src('./src/bower_components/**/*')
      .pipe(plugins.filter('**/*.{eot,otf,svg,ttf,woff,woff2}'))
      .pipe(gulp.dest('dist.dev/fonts'));
};

pipes.validatedPartials = function() {
  return gulp.src(paths.partials)
      .pipe(plugins.htmlhint({'doctype-first': false}))
      .pipe(plugins.htmlhint.reporter());
};

pipes.builtPartialsDev = function() {
  return pipes.validatedPartials()
      .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedPartials = function() {
  return pipes.validatedPartials()
      //.pipe(plugins.htmlhint.failReporter())
     // .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
      //.pipe(plugins.ngHtml2js({
      	//moduleName: "NomaSana",
      	//prefix: "/partials" }));
};

pipes.builtPartialsProd = function() {
  return pipes.validatedPartials()
      .pipe(plugins.htmlhint.failReporter())
      .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
      .pipe(gulp.dest(paths.distProd));
};

pipes.builtStylesDev = function() {
  return gulp.src(paths.styles)
      .pipe(plugins.sass())
      .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesProd = function() {
  return gulp.src(paths.styles)
      .pipe(plugins.sourcemaps.init())
          .pipe(plugins.sass())
          .pipe(plugins.minifyCss())
      .pipe(plugins.sourcemaps.write())
      .pipe(pipes.minifiedFileName())
      .pipe(gulp.dest(paths.distProd));
};

pipes.builtFaviconsDev = function() {
  return gulp.src(paths.favicons)
      .pipe(gulp.dest('dist.dev/favicons'));
};

pipes.validatedIndex = function() {
  return gulp.src(paths.index)
      .pipe(plugins.htmlhint())
      .pipe(plugins.htmlhint.reporter())
};

pipes.builtIndexDev = function() {
  
  var orderedVendorScripts = pipes.builtVendorScriptsDev()
                             .pipe(pipes.orderedVendorScripts());

  var orderedAppScripts = pipes.builtAppScriptsDev()
      .pipe(pipes.orderedAppScripts());

  var appStyles = pipes.builtStylesDev();

  return pipes.validatedIndex()
      .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
      .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower'}))
      .pipe(plugins.inject(orderedAppScripts, {relative: true}))
      .pipe(plugins.inject(appStyles, {relative: true}))
      .pipe(gulp.dest(paths.distDev));
};

pipes.builtIndexProd = function() {
  
  var vendorScripts = pipes.builtVendorScriptsProd();
  var appScripts = pipes.builtAppScriptsProd();
  var appStyles = pipes.builtStylesProd();
  //var appPartials = pipes.builtPartialsProd();

  return pipes.validatedIndex()
      .pipe(gulp.dest(paths.distProd))
      .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower'}))
      .pipe(plugins.inject(appScripts, {relative: true}))
      .pipe(plugins.inject(appStyles, {relative: true}))
      //.pipe(plugins.inject(appPartials, {relative: true}))
      .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
      .pipe(gulp.dest(paths.distProd))
};

// use the sw-precache module to generate sw.js
pipes.builtServiceWorker = function(callback) {
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = paths.distDev;

  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,ttf,woff,woff2}'],
    stripPrefix: rootDir
  }, callback);
};

//web app manifest
pipes.builtManifestDev = function() {
  return gulp.src('./manifest.json')
      .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppDev = function() {
  return es.merge(pipes.builtIndexDev(), pipes.builtPartialsDev());
       // streamqueue({objectMode: false, 
                  //   pipes.builtIndexDev,
                  //   pipes.builtPartialsDev
                //   });
};

pipes.builtAppDevWithServiceWorker = function() {
  return es.merge(pipes.builtAppDev(), pipes.builtServiceWorker());
};

pipes.builtAppProd = function() {
  return pipes.builtIndexProd();
};

pipes.orderedmanenos = function() {
  return pipes.builtAppDev()
      .pipe(pipes.orderedVendorScripts());
};

// === TASKS ================

// removes all compiled dev files
gulp.task('clean-dev', function() {
  var deferred = Q.defer();
  del(paths.distDev, function() {
  	deferred.resolve();
  });
  return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
  var deferred = Q.defer();
  del(paths.distProd, function() {
  	deferred.resolve();
  });
  return deferred.promise;
});

// checks html source files for syntax errors
gulp.task('validate-partials', pipes.validatedPartials);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev enviroment
gulp.task('build-partials-dev', pipes.builtPartialsDev);

// partial proudctions
gulp.task('build-partials-prod', pipes.builtPartialsProd);

// converts partials to javascript using html2js
gulp.task('convert-partials-to-js', pipes.scriptedPartials);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// moves app scrtips into the dev enviroment
gulp.task('build-app-scripts-dev', pipes.bultAppScriptsDev);

// concatenates, uglifies, and moves app scripts and partials into the prod env
gulp.task('buld-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev env
gulp.task('build-styles-dev', pipes.builtStylesDev);

// compiles and minifies app sass to css and moves to the prod env
gulp.task('build-styles-prod', pipes.builtStylesProd);

// moves vendor scripts into the dev env
gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

// concatenates, uglifies and moves vendor scripts into the prod env
gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

// bootstrap fonts dev
gulp.task('build-bootstrap-fonts-dev', pipes.builtBootstrapFontsDev);

// validates and injects sources into index.html and moves it to the dev env
gulp.task('build-index-dev', pipes.builtIndexDev);

// validate and injects sources into the index.html, minifies and moves it to the prod env
gulp.task('build-index-prod', pipes.builtIndexProd);

//favicons
gulp.task('build-favicons-dev', pipes.builtFaviconsDev);

// builds a complete dev env
gulp.task('build-app-dev', ['build-favicons-dev'], pipes.builtAppDev);

//sw
gulp.task('build-sw', pipes.builtServiceWorker);

//manifest
gulp.task('build-manifest-dev', pipes.builtManifestDev);

//manenos
gulp.task('build-manenos-dev', pipes.orderedmanenos);

// builds a complete prod env
gulp.task('build-app-prod', ['build-partials-prod'], pipes.builtAppProd);

//build dev with sw
gulp.task('build-app-dev-pwa',['build-app-dev','build-manifest-dev']);

// cleans and builds a complete dev env
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// cleans and builds a complete prod env
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

// default task builds for prod
gulp.task('default', ['clean-build-app-prod']);

//kimangoto
gulp.task('kimangoto', ['clean-dev',
						'build-partials-dev',
						'build-app-scripts-dev',
						'build-styles-dev',
						'build-vendor-scripts-dev',
						'build-bootstrap-fonts-dev',
						'build-index-dev']);

gulp.task('kimangoto-prod', ['buld-app-scripts-prod',
	                         'build-styles-prod',
	                         'build-vendor-scripts-prod',
	                         'build-index-prod']);

gulp.task('build-pwa', function() {
  runSequence(['build-app-dev-pwa'],['build-sw']);
 });

gulp.task('connect', function() {
  connect.server({
  	root: 'dist.dev/',
  	port: 8082
  });
});

// connect prod
gulp.task('connectDist', function() {
  connect.server({
  	root: 'dist/dist.prod/',
  	port: 9999,
  	middleware: function(connect, opt) {
  	  return [['src/bower_components',
  	            connect["static"]('./src/bower_components')]]
  	}
  });
});