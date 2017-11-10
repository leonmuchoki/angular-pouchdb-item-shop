angular.module("store")
  .component('navBar', {
  	bindings: {},
  	templateUrl: 'nav/_navBar.html',
  	controller: 'NavBarCtrl'
  })
  .controller('NavBarCtrl', ["$state", function($state) {
  	var vc= this;
  }]);