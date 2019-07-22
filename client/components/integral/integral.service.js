'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Integral', function ($resource) {
    return $resource('/api/integrals', {
      id: '@_id'
    },
    {
	    index: {
	    	method: 'GET'
	    }
	});
  });

