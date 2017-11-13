angular.module("store")
  .controller("CreditorCtrl", ['$scope','$rootScope','$state','$stateParams','pouchDB', 
  	           function($scope,$rootScope,$state,$stateParams,pouchDB) {
  	var vm = this;

  	$scope.creditors = {};
 
    pouchDB.startListening();

        //--------------------------------------
    //fetch all items
    //--------------------------------------
    pouchDB.getAll("creditors:","creditors:\uffff").then(function(data) {
      data.rows.map(function(data) {
        $scope.creditors[data.doc._id] = data.doc;
       });
    });
 
    $rootScope.$on("pouchDB:change", function(event, data) {
        //$scope.items[data.doc._id] = data.doc;
        $scope.$apply();
       //console.log("item.controller:::data-->>" + JSON.stringify(data));
    });
 

    $rootScope.$on("pouchDB:delete", function(event, data) {
        delete $scope.creditors[data.doc._id];
        $scope.$apply();
    });
 
    if($stateParams.documentId) {
        pouchDB.get($stateParams.documentId).then(function(result) {
            $scope.inputForm = result;
        });
    }
 
    $scope.save = function(creditor_name, mobileno, item_name, item_qty,item_amount) {
        var jsonDocument = {
            "_id": ("creditors:"+ ( new Date() ).getTime()),
            "creditor_name": creditor_name,
            "mobileno": mobileno,
            "item_name": item_name,
            "item_quantity": item_qty,
            "item_amount": item_amount
        };
        if($stateParams.documentId) {
            jsonDocument["'_id'"] = $stateParams.documentId;
            jsonDocument["'_rev'"] = $stateParams.documentRevision;
        }
        pouchDB.save(jsonDocument).then(function(response) {
            $state.go("items");
            console.log('saved successfully.');
        }, function(error) {
            console.log("ERROR -> " + error);
        });
    };
 
    $scope.delete = function(id, rev) {
        pouchDB.delete(id, rev);
    };
  }]);