angular.module("store", ["ui.router"])
  .run(function(pouchDB) {
  	pouchDB.setDatabase("alexis-store");
  })
  .config(function($stateProvider, $urlRouterProvider) {
  	$stateProvider
  	  .state("items", {
  	  	"url": "/items",
  	  	"templateUrl": "items/item.html",
  	  	"controller": "ItemCtrl"
  	  })
  	  .state("add-item", {
  	  	"url": "/add-item",
  	  	"templateUrl": "items/add_item.html",
  	  	"controller": "ItemCtrl"
  	  });

  	$urlRouterProvider.otherwise("items");
  });