'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Gift', function ($resource) {
	  console.log('11111')
    return $resource('/api/gifts/:id/:controller', {
      id: '@_id'
    },
    {
	    index: {
	    	method: 'GET'
	    },
	    create: {
	    	method: 'POST'
	    },
	    update:{
	    	method: 'PUT'
	    },
    	changestate: {
     		method: 'PUT',
     		params:{
				id:'changestate'
			}
    	},
    	destory:{
    		method: 'DELETE',
		}
	});
});

