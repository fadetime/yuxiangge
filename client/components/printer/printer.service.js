'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Printer', function ($resource) {
    return $resource('/api/prints/:id', {
      id: '@_id'
    },
    {
	    index:{
	    	method: 'GET'
	    },
      show:{
        method: 'GET'
      },
      create:{
        method: 'POST'
      },
      update:{
        method: 'PUT'
      },
      destroy:{
        method: 'DELETE'
      }
	});
  });
