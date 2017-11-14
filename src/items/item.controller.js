angular.module("store")
  .controller("ItemCtrl", ['$scope','$rootScope','$state','$stateParams','pouchDB', 
               function($scope,$rootScope,$state,$stateParams,pouchDB) {
    var vm = this;

    $scope.items = {};
 
    pouchDB.startListening();

        //--------------------------------------
    //fetch all items
    //--------------------------------------
    pouchDB.getAll("items:","items:\uffff").then(function(data) {
      data.rows.map(function(data) {
        $scope.items[data.doc._id] = data.doc;
       });
    });
 
    $rootScope.$on("pouchDB:change", function(event, data) {
        //$scope.items[data.doc._id] = data.doc;
        $scope.$apply();
       //console.log("item.controller:::data-->>" + JSON.stringify(data));
    });
 

    $rootScope.$on("pouchDB:delete", function(event, data) {
        delete $scope.items[data.doc._id];
        $scope.$apply();
    });
 
    if($stateParams.documentId) {
        pouchDB.get($stateParams.documentId).then(function(result) {
            $scope.inputForm = result;
        });
    }
 
    $scope.save = function(item_name, partno, item_price, item_quantity) {
        var jsonDocument = {
            "_id": ("items:"+ ( new Date() ).getTime()),
            "item_name": item_name,
            "partno": partno,
            "item_price": item_price,
            "item_quantity": item_quantity
        };
        if($stateParams.documentId) {
            jsonDocument["'_id'"] = $stateParams.documentId;
            jsonDocument["'_rev'"] = $stateParams.documentRevision;
        }
        pouchDB.save(jsonDocument).then(function(response) {
            //$state.go("sale");
            $state.reload();
            console.log('saved successfully.');
        }, function(error) {
            console.log("ERROR -> " + error);
        });
    };

    $scope.updateQty = function(id,rev,item_name, partno, item_price, item_quantity, added_quantity) {
        var updateDocument = {
            "_id": id,
            "_rev": rev,
            "item_name": item_name,
            "partno": partno,
            "item_price": item_price,
            "item_quantity": (item_quantity + added_quantity)
        };
        
        pouchDB.save(updateDocument).then(function(response) {
            //$state.go("sale");
            $state.reload();
            console.log('saved successfully.');
        }, function(error) {
            console.log("ERROR -> " + error);
        });
    };
 
    $scope.delete = function(id, rev) {
      pouchDB.delete(id, rev);
    };

    $scope.clear = function() {
      $state.reload();
    };
    
  }]);