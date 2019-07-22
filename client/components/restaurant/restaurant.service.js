'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Restaurant', function ($resource) {
    return $resource('/api/restaurants/:id/:controller', {
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
	    	method:'PUT',
	    	params:{
	    		id:'update',
	    		controller:'selfinfo'
	    	}
	    }
	});
});