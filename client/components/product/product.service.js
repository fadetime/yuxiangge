'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Product', function ($resource) {
    return $resource('/api/products/:id/:controller', {
      id: '@_id'
    },
    {
      
      index: {
        method: 'GET'
      },
      show: {
        method: 'GET'
      },
      create: {
        method: 'POST'
      },
      update: {
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
