'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Waiter', function ($resource) {
    return $resource('/api/waiters/:id', {
      id: '@_id'
    },
    {
	    index: {
	    	method: 'GET'
	    },

	    create:{
	    	method:'POST'
	    },
	    update:{
	    	method:'PUT'
	    },
      destory:{
        method: 'DELETE'
      }
	});
});

