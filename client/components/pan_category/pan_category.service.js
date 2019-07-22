'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Pan_category', function ($resource) {
    return $resource('/api/pan-categories/:id/:controller', {
      id: '@_id'
    },
    {
	    index:{
	    	method: 'GET'
	    },
      create:{
        method: 'POST'
      },
      update:{
        method: 'PUT'
      },
      destory:{
        method: 'DELETE'
      },
      changestate: {
        method: 'PUT',
        params:{
          id:'changestate'
        }
      }
	});
  });
