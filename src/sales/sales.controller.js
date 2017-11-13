angular.module("store")
  .controller("SaleCtrl", ['$scope','$rootScope','$state','$stateParams','pouchDB','moment', 
  	           function($scope,$rootScope,$state,$stateParams,pouchDB,moment) {
  	var vm = this;

  	$scope.items = {};
    $scope.items_sold = {};

    $scope.sold_items = [];
    $scope.total_amount = 0.00;
 
    pouchDB.startListening();
    
    //--------------------------------------
    //fetch all items
    //--------------------------------------
    pouchDB.getAll("items:","items:\uffff").then(function(data) {
      data.rows.map(function(data) {
        $scope.items[data.doc._id] = data.doc;
        console.log("items juu data-->>" + JSON.stringify(data));
        console.log("items data-->>" + JSON.stringify(data.doc));
       });
    });

     //--------------------------------------
    //fetch sold items
    //--------------------------------------
    pouchDB.getAll("sales:","sales:\uffff").then(function(data) {
      data.rows.map(function(data) {
        $scope.items_sold[data.doc._id] = data.doc;
       });
    });

    $rootScope.$on("pouchDB:change", function(event, data) {
     // $scope.items[data.doc._id] = data.doc;

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
             $state.reload();
             console.log('saved successfully.');
             }, function(error) {
                console.log("ERROR -> " + error);
             });
           });
        
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
          "item_quantity": itemquantity,
          "created_at": (new Date())
        });

        // update total amount
        $scope.total_amount = sub_total;
    };
  }]);