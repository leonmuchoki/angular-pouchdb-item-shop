angular.module("store") 
.service("pouchDB", ["$rootScope", "$q", function($rootScope, $q) {
 
    var database;
    var changeListener;
 
    this.setDatabase = function(databaseName) {
        database = new PouchDB(databaseName);
    };
 
    this.startListening = function() {
        changeListener = database.changes({
            live: true,
            include_docs: true
        }).on("change", function(change) {
            if(!change.deleted) {
                $rootScope.$broadcast("pouchDB:change", change);
            } else {
                $rootScope.$broadcast("pouchDB:delete", change);
            }
        });
    };
 
    this.stopListening = function() {
        changeListener.cancel();
    };
 
    this.sync = function(remoteDatabase) {
        database.sync(remoteDatabase, {live: true, retry: true});
    };
 
    this.save = function(jsonDocument) {
        var deferred = $q.defer();
        if(!jsonDocument._id) {
            database.post(jsonDocument).then(function(response) {
                deferred.resolve(response);
            }).catch(function(error) {
                deferred.reject(error);
            });
        } else {
            database.put(jsonDocument).then(function(response) {
                deferred.resolve(response);
            }).catch(function(error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    };
 
    this.delete = function(documentId, documentRevision) {
        return database.remove(documentId, documentRevision);
    };
 
    this.get = function(documentId) {
        return database.get(documentId);
    };

    this.getAll = function(start_key, end_key) {
      var deferred = $q.defer();

      database.allDocs({
          include_docs: true,
          startkey: start_key,
          endkey: end_key
        }).then(function(response) {
             deferred.resolve(response);
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };
 
    this.destroy = function() {
        database.destroy();
    };
 
}]);