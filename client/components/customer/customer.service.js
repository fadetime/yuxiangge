'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Customer', function ($resource) {
    return $resource('/api/customers/:id', {
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
      }
	});
  });

