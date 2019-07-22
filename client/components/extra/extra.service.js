'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Extra', function ($resource) {
    return $resource('/api/extras/:id/:controller', {
      id: '@_id'
    },
    {
	    index: {
	    	method: 'GET'
	    },
      create: {
        method: 'POST'
      },
      update: {
        method: 'PUT'
      },
      changestate:{
        method: "PUT",
        params:{
          id:"changestate"
        }
      },
      destory:{
        method: 'DELETE'
      }
	});
});

