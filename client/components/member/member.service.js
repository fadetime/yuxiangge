'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Member', function ($resource) {
    return $resource('/api/members', {
      id: '@_id'
    },
    {
	    index: {
	    	method: 'GET'
	    }
	});
  });

