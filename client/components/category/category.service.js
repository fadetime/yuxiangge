'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Category', function ($resource) {
    return $resource('/api/categories/:id', {
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
      sort:{
        method: 'PUT',
        params:{
          id:"sort"
        }
      },
      destory:{
        method:'DELETE'
      }
	});
});

