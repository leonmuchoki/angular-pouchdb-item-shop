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
  	  })
      .state("sale", {
        "url": "/sale",
        "templateUrl": "sales/sale.html",
        "controller": "SaleCtrl"
      });

  	$urlRouterProvider.otherwise("items");
  });