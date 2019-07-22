'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Pan_soup', function ($resource) {
    return $resource('/api/pan-soups/:id/:controller', {
      id: '@_id'
    },
    {
	    index:{
	    	method: 'GET'
	    },
      create:{
        method: 'POST'
      },
      show:{
        method: 'GET'
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
        method: 'DELETE'
      }
	});
  });
