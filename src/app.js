angular.module("store", ["ui.router","angularMoment","ngMaterial"])
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
      })
      .state("creditors", {
        "url": "/creditor",
        "templateUrl": "creditors/creditor.html",
        "controller": "CreditorCtrl"
      });

  	$urlRouterProvider.otherwise("items");
  })

  .filter('offset', function() {
    return function(input, start) {
      start = parseInt(start, 10);
      return input.slice(start);
    };
  });