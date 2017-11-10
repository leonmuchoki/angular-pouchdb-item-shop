angular.module("store")
  .component('sideBar', {
  	bindings: {},
  	templateUrl: 'nav/_sideBar.html',
  	controller: 'SideBarCtrl'
  })
.controller('SideBarCtrl', ["$state", function($state) {
	var vc= this;
}]);