angular.module("store")
  .controller("SaleCtrl", ['$scope','$rootScope','$state','$stateParams','pouchDB', 
  	           function($scope,$rootScope,$state,$stateParams,pouchDB) {
  	var vm = this;

  	$scope.items = {};

    $scope.sold_items = [];
    $scope.total_amount = 0.00;
 
    pouchDB.startListening();
 
    $rootScope.$on("pouchDB:change", function(event, data) {
        $scope.items[data.doc._id] = data.doc;
        $scope.$apply();
    });
 

    $rootScope.$on("pouchDB:delete", function(event, data) {
        delete $scope.items[data.doc._id];
        $scope.$apply();
    });
 
    if($stateParams.documentId) {
        $pouchDB.get($stateParams.documentId).then(function(result) {
            $scope.inputForm = result;
        });
    }
 
    $scope.saveSoldItems = function() {
        var soldItemsArrayObject = $scope.sold_items;
        
         angular.forEach(soldItemsArrayObject, function(value, key) {
          console.log("key:-" + key + " value:-" + JSON.stringify(value));
          
          pouchDB.save(value).then(function(response) {
             $state.go("items");
             console.log('saved successfully.');
             }, function(error) {
                console.log("ERROR -> " + error);
             });
           });

        // console.log("saveSoldItems:>>>>" + $scope.sold_items);
        // if($stateParams.documentId) {
        //     jsonDocument["'_id'"] = $stateParams.documentId;
        //     jsonDocument["'_rev'"] = $stateParams.documentRevision;
        // }
        
    };
 
    $scope.delete = function(id, rev) {
        pouchDB.delete(id, rev);
    };
    
    var sub_total = 0.00;
    $scope.addToSlip = function(itemname,partno,itemprice, itemquantity) {
        
        var amount = itemprice * itemquantity;
        sub_total = sub_total + amount;

        $scope.sold_items.push({
          "_id": ("sales:"+ ( new Date() ).getTime()),
          "item_name": itemname,
          "partno": partno,
          "item_price": amount,
          "item_quantity": itemquantity
        });

        // update total amount
        $scope.total_amount = sub_total;
    };
  }]);