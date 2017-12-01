//importScripts('/cache-polyfill.js');


self.addEventListener('install', function(e) {
  // console.log('in install...');
  e.waitUntil(
  	caches.open('alexis').then(function(cache) {
  	  return cache.addAll([
  	  	'/',
  	  	'/bower_components/moment/moment.js',
  	  	'bower_components/angular-moment/angular-moment.js',
  	  	'/bower_components/angular-messages/angular-messages.js',
  	  	'/bower_components/angular/angular.js',
  	  	'/bower_components/jquery/dist/jquery.js',
  	  	'/bower_components/angular-ui-router/release/angular-ui-router.js',
  	  	'/bower_components/bootstrap/dist/css/bootstrap.css',
  	  	'/bower_components/bootstrap/dist/js/bootstrap.js',
  	  	'/bower_components/pouchdb/dist/pouchdb.js',
  	  	'/index.html',
  	  	'/app.js',
  	  	'/creditors/creditor.html',
  	  	'/creditors/_add_creditor.html',
  	  	'/creditors/_view_creditors.html',
  	  	'/creditor.controller.js',
  	  	'/items/item.html',
  	  	'/items/_items_list.html',
  	  	'/items/_update_quantity.html',
  	  	'/items/add_item.html',
  	  	'/items/item.css',
  	  	'/item.controller.js',
  	  	'/nav/_navBar.html',
  	  	'/nav/_navBar_links.html',
  	  	'/nav/navbar.css',
  	  	'/navComponent.js',
  	  	'/nav/_sideBar.html',
  	  	'/nav/_sideBar_links.html',
  	  	'/nav/sidebar.css',
  	  	'/sideBarComponent.js',
  	  	'/sales/sale.html',
  	  	'/sales/_sale_items.html',
  	  	'/sales/_sale_slip.html',
  	  	'/sales/_sold_items.html',
  	  	'/sales.controller.js',
  	  	'/pouchdb_service.js'
  	  	]);
  	  })
  	);
  //console.log('after install...');
});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
  event.respondWith(
  	caches.match(event.request).then(function(response) {
  	  return response || fetch(event.request);
  	}) 
   );
});