angular.module("store")
  .controller("SaleCtrl", ['$scope','$rootScope','$state','$stateParams','pouchDB','moment', 
  	           function($scope,$rootScope,$state,$stateParams,pouchDB,moment) {
  	var vm = this;

  	$scope.items = {};
    $scope.all_items = [];
    $scope.items_sold = {};
    $scope.update_items = [];

    $scope.sold_items = [];
    $scope.total_amount = 0.00;

    $scope.itemsPerPage = 5;
    $scope.currentPage = 0;
 
    pouchDB.startListening();
    
    //--------------------------------------
    //fetch all items
    //--------------------------------------
    pouchDB.getAll("items:","items:\uffff").then(function(data) {
      data.rows.map(function(data) {
        $scope.items[data.doc._id] = data.doc;
        // remove key as we don't need it for now:
         $scope.all_items.push( $scope.items[data.doc._id]);
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
 
 
    if($stateParams.documentId) {
        $pouchDB.get($stateParams.documentId).then(function(result) {
            $scope.inputForm = result;
        });
    }
 
    //-------------------------------------------
    //--save sold items
    //-------------------------------------------
    $scope.saveSoldItems = function() {
        var soldItemsArrayObject = $scope.sold_items;
        
         angular.forEach(soldItemsArrayObject, function(value, key) {
          //console.log("key:-" + key + " value:-" + JSON.stringify(value));

          pouchDB.save(value).then(function(response) {
             $state.reload();
             //console.log('saved successfully.');
             }, function(error) {
                console.log("ERROR -> " + error);
             });
           });
        
    };

    //-------------------------------------------
    //--update quantity sold
    //-------------------------------------------
    $scope.updateQuantitySold = function() {
      var updateItems = $scope.update_items; 
         
      angular.forEach(updateItems, function(value, key) {
        pouchDB.save(value).then(function(response) {
          $state.reload();
          console.log('updated successfully.');
        }, function(error) {
          console.log("ERROR -> " + error);
        });
        });   
        
    };
    
    //-------------------------------------------
    //--delete items
    //-------------------------------------------
    $scope.delete = function(id, rev) {
        pouchDB.delete(id, rev);
    };

    $rootScope.$on("pouchDB:delete", function(event, data) {
      delete $scope.items[data.doc._id];
      $scope.$apply();
    });
 
    //-------------------------------------------
    //--append items to slip/cart
    //-------------------------------------------   
    var sub_total = 0.00;
    $scope.addToSlip = function(id,rev,itemname,partno,itemprice, itemquantity, old_quantity) {
        
        var amount = itemprice * itemquantity;
        sub_total = sub_total + amount;

        $scope.sold_items.push({
          "_id": ("sales:"+ ( new Date() ).getTime()),
          "item_name": itemname,
          "partno": partno,
          "item_price": amount,
          "item_quantity": itemquantity,
          "created_at": (new Date()),
          "id": id,  // track id and rev so as to update quantity sold 
          "rev": rev,
          "new_quantity": (old_quantity - itemquantity)
        });

        // update total amount
        $scope.total_amount = sub_total;

        // keep track of items to update:
        $scope.update_items.push({
          "_id": id,  // track id and rev so as to update quantity sold 
          "_rev": rev,
          "item_name": itemname,
          "partno": partno,
          "item_price": amount,
          "item_quantity": (old_quantity - itemquantity)
        });
    };

    //----------------------------------
    // pagination
    //----------------------------------
    $scope.range = function() {
      var rangeSize = 5;
      var ret = [];
      var start;

      start = $scope.currentPage;
      if ( start > $scope.pageCount()-rangeSize ) {
        start = $scope.pageCount()-rangeSize+1;
      }

      for (var i=start; i<start+rangeSize;i++) {
        ret.push(i);
      }

      return ret;
    };

    $scope.prevPage = function() {
      if ($scope.currentPage > 0) {
        $scope.currentPage--;
      }
    };

    $scope.prevPageDisabled = function() {
      return $scope.currentPage === 0 ? "disabled" : "";
    };

    $scope.pageCount = function() {
      return Math.ceil($scope.all_items.length/$scope.itemsPerPage) - 1;
    };

    $scope.nextPage = function() {
      if ($scope.currentPage < $scope.pageCount()) {
        $scope.currentPage++;
      }
    };

    $scope.nextPageDisabled = function() {
      return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
    };

    $scope.setPage = function(n) {
      $scope.currentPage = n;
    };
    
  }]);