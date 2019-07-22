'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      forceToChange: {
        method: 'PUT',
        params: {
          controller:'forceToChangePassword'
        }
      },
	  });
  });
