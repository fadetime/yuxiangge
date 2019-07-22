'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Language', ['$resource', function ($resource) {
    return $resource('/api/language/pack', {
     id: '@_id'
    },
    {
      getPack: {
        method: 'GET'
      }

    });
  }]);
