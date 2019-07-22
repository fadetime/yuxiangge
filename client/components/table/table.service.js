'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Table', function ($resource) {
    return $resource('/api/tables/:id/:controller', {
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
      },
      destory:{
        method: 'DELETE'
      }
	  });
  });
