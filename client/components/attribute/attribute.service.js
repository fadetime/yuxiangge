'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Attribute', function ($resource) {
    return $resource('/api/attributes', {
      id: '@_id'
    },
    {
	    index: {
	    	method: 'GET'
	    },
	    create:{
	    	method: 'POST'
	    },
	    destroyAll:{
	    	method: 'DELETE'
	    }
	});
});