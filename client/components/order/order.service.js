'use strict';

angular.module('kuaishangcaiwebApp')
  .factory('Order', function ($resource) {
    return $resource('/api/orders/:id/:b', {
      id: '@_id'
    },
    {
	    index:{
	    	method: 'GET',
	    	params:{
	        	id:'print',
	        	b:'index'
	        }
	    },
	    show:{
	    	method: 'GET'
	    },
	    getChange:{
	    	method: 'GET',
	    	params:{
	    		id:"print",
	    		b:"ongoingchange"
	    	}
	    },
	    dealChange:{
	    	method:"PUT",
	    	params:{
	    		id:"dealchange"
	    	}
	    },
	    statistic:{
	    	method:'GET',
	    	params:{
	    		id:"statistics",
	    		b:"bydate"
	    	}
	    },
	    update:{
	    	method:'PUT'
	    },
	    changePrintState:{
	    	method:'PUT',
	    	params:{
	    		id:"changePrintState"
	    	}
	    },
	    bindAccount:{
	    	method:'PUT',
	    	params:{
	    		id:"bind-account"
	    	}
	    }
	});
  });

