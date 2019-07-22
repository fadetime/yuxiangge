'use strict';

angular.module('kuaishangcaiwebApp')
  .config(function ($stateProvider) {
    $stateProvider
      //管理---菜品列表
      .state('restaurant-products-view', {
        params:{"navValue":"restaurant-products-view"},
        url: '/restaurant/products-view?token&hasNav&page&itemsPerPage&category&separatCategory&sortBy&search',
        templateUrl: 'app/restaurant/product/product-view.html',
        controller: 'ViewProductCtrl',
        controllerAs: 'viewProductCtrl',
        // authenticate: true
        // reloadOnSearch: false
      })
      //管理---菜品编辑
      .state('restaurant-products-edit', {
        params:{"navValue":"restaurant-products-view"},
        url: '/restaurant/products-edit/:id?token&hasNav',
        templateUrl: 'app/restaurant/product/product-edit.html',
        controller: 'EditProductCtrl',
        controllerAs: 'editProductCtrl',
        // authenticate: true
      }) 
      //管理---菜品添加
      .state('restaurant-products-add', {
        params:{"navValue":"restaurant-products-view"},
        url: '/restaurant/products-add?token&hasNav',
        templateUrl: 'app/restaurant/product/product-add.html',
        controller: 'AddProductCtrl',
        controllerAs: 'addProductCtrl',
        // authenticate: true
      })
      // 管理---分类列表
      .state('restaurant-categories-view', {
        params:{"navValue":"restaurant-products-view"},
        url: '/restaurant/categories-view',
        templateUrl: 'app/restaurant/product/category-view.html',
        controller: 'ViewCategoryCtrl',
        controllerAs: 'viewCategoryCtrl',
        // authenticate: true
      })
      // 管理---额外收费列表
      .state('restaurant-extras-view', {
        params:{"navValue":"restaurant-extras-view"},
        url: '/restaurant/extras-view?page&itemsPerPage',
        templateUrl: 'app/restaurant/extra/extra-view.html',
        controller: 'ViewExtraCtrl',
        controllerAs: 'viewExtraCtrl',
        // authenticate: true
      })
      // 管理---锅底列表
      .state('restaurant-pans-view', {
        params:{"navValue":"restaurant-pans-view"},
        url: '/restaurant/pans-view',
        templateUrl: 'app/restaurant/pan/pan-view.html',
        controller: 'ViewPanCtrl',
        controllerAs: 'viewPanCtrl',
        // authenticate: true
      })
      // 管理---汤底列表
      .state('restaurant-soups-view', {
        params:{"navValue":"restaurant-pans-view"},
        url: '/restaurant/soups-view?page&itemsPerPage&',
        templateUrl: 'app/restaurant/pan/soup-view.html',
        controller: 'ViewSoupCtrl',
        controllerAs: 'viewSoupCtrl',
        // authenticate: true
      })
      // 管理---汤底新增
      .state('restaurant-soups-add', {
        params:{"navValue":"restaurant-pans-view"},
        url: '/restaurant/soups-add',
        templateUrl: 'app/restaurant/pan/soup-add.html',
        controller: 'AddSoupCtrl',
        controllerAs: 'addSoupCtrl',
        // authenticate: true
      })
      // 管理---汤底修改
      .state('restaurant-soups-edit', {
        params:{"navValue":"restaurant-pans-view"},
        url: '/restaurant/soups-edit/:id',
        templateUrl: 'app/restaurant/pan/soup-edit.html',
        controller: 'EditSoupCtrl',
        controllerAs: 'editSoupCtrl',
        // authenticate: true
      })
      // 管理---汤底口味列表
      .state('restaurant-tastes-view', {
        params:{"navValue":"restaurant-tastes-view"},
        url: '/restaurant/tastes-view?page&itemsPerPage&',
        templateUrl: 'app/restaurant/taste/taste-view.html',
        controller: 'ViewTasteCtrl',
        controllerAs: 'viewTasteCtrl',
        // authenticate: true
      })
      //管理---餐桌列表
      .state('restaurant-tables-view', {
        params:{"navValue":"restaurant-tables-view"},
        url: '/restaurant/tables-view',
        templateUrl: 'app/restaurant/table/table-view.html',
        controller: 'ViewTableCtrl',
        controllerAs: 'viewTableCtrl',
        // authenticate: true
      })
      // 管理---礼品列表
      .state('restaurant-gifts-view', {
        params:{"navValue":"restaurant-gifts-view"},
        url: '/restaurant/gifts-view',
        templateUrl: 'app/restaurant/gift/gift-view.html',
        controller: 'ViewGiftCtrl',
        controllerAs: 'viewGiftCtrl',
        // authenticate: true
      })



      //客户---客户列表
      .state('restaurant-customers-view', {
        params:{"navValue":"restaurant-customers-view"},
        url: '/restaurant/customers-view?page&itemsPerPage&sortBy&retrieval',
        templateUrl: 'app/restaurant/customer/customer-view.html',
        controller: 'ViewCustomerCtrl',
        controllerAs: 'viewCustomerCtrl',
        // authenticate: true
      })
      // 客户---消费记录
      .state('restaurant-consume-record', {
        params:{"navValue":"restaurant-customers-view"},
        url: '/restaurant/consume-record/:id',
        templateUrl: 'app/restaurant/customer/consume-record.html',
        controller: 'ConsumeRecordCtrl',
        controllerAs: 'consumeRecordCtrl',
        // authenticate: true
      })
      // 客户---消费详情
      .state('restaurant-consume-detail', {
        params:{"navValue":"restaurant-customers-view"},
        url: '/restaurant/consume-detail/:id',
        templateUrl: 'app/restaurant/customer/consume-detail.html',
        controller: 'ConsumeDetailCtrl',
        controllerAs: 'consumeDetailCtrl',
        // authenticate: true
      })
      // 客户---积分记录
      .state('restaurant-integral-record', {
        params:{"navValue":"restaurant-customers-view"},
        url: '/restaurant/integral-record/:id?_restaurant',
        templateUrl: 'app/restaurant/customer/integral-record.html',
        controller: 'IntegralRecordCtrl',
        controllerAs: 'integralRecordCtrl',
        // authenticate: true
      })


      // 账单---账单列表
      .state('restaurant-orders-view', {
        params:{"navValue":"restaurant-orders-view"},
        url: '/restaurant/orders-view?date&page&itemsPerPage',
        templateUrl: 'app/restaurant/order/order-view.html',
        controller: 'ViewOrderCtrl',
        controllerAs: 'viewOrderCtrl',
        // authenticate: true
      })
      // 账单---账单详情
      .state('restaurant-orders-detail', {
        params:{"navValue":"restaurant-orders-view"},
        url: '/restaurant/orders-detail/:id',
        templateUrl: 'app/restaurant/order/order-detail.html',
        controller: 'OrderDetailCtrl',
        controllerAs: 'orderDetailCtrl',
        // authenticate: true
      })

      // 账单---账单编辑
      .state('restaurant-orders-edit', {
        params:{"navValue":"restaurant-orders-view"},
        url: '/restaurant/orders-edit/:id',
        templateUrl: 'app/restaurant/order/order-edit.html',
        controller: 'OrderEditlCtrl',
        controllerAs: 'orderEditlCtrl',
        // authenticate: true
      })

      // 账单---数据统计
      .state('restaurant-statistic', {
        params:{"navValue":"restaurant-statistic"},
        url: '/restaurant/statistic?startTime&endTime&token&hasNav',
        templateUrl: 'app/restaurant/statistic/statistic.html',
        controller: 'StatisticCtrl',
        controllerAs: 'statisticCtrl',
        // authenticate: true
      })

      // 账单---积分增加
      .state('restaurant-integral-add', {
        params:{"navValue":"restaurant-integral-add"},
        url: '/restaurant/restaurant-integral/add',
        templateUrl: 'app/restaurant/integral/integral-add.html',
        controller: 'IntegralAddCtrl',
        controllerAs: 'integralAddCtrl',
        // authenticate: true
      })

      // 职工
      .state('restaurant-waiter', {
        params:{"navValue":"restaurant-waiter"},
        url: '/restaurant/waiter?retrieval&page&itemsPerPage',
        templateUrl: 'app/restaurant/waiter/waiter-view.html',
        controller: 'WaiterCtrl',
        controllerAs: 'waiterCtrl',
        // authenticate: true
      })

      // 个人
      .state('restaurant-personals-view', {
        url: '/restaurant/personals-view/:id?state',
        templateUrl: 'app/restaurant/personal/personal-view.html',
        controller: 'PersonalViewCtrl',
        controllerAs: 'personalViewCtrl',
        // authenticate: true
      })

      //打印机测试
      .state('printer-test', {
        url: '/restaurant/printer-test',
        templateUrl: 'app/restaurant/printer/printer-test.html',
        controller: 'PrinterCtrl',
        controllerAs: 'printerCtrl',
        // authenticate: true
      })

      //打印机列表
      .state('restaurant-printers-view', {
        params:{"navValue":"restaurant-printers-view"},
        url: '/restaurant/printers-view',
        templateUrl: 'app/restaurant/printer/printer-view.html',
        controller: 'PrinterViewCtrl',
        controllerAs: 'printerViewCtrl',
        // authenticate: true
      })
      .state('restaurant-printers-add', {
        params:{"navValue":"restaurant-printers-view"},
        url: '/restaurant/printers-add',
        templateUrl: 'app/restaurant/printer/printer-add.html',
        controller: 'PrinterAddCtrl',
        controllerAs: 'printerAddCtrl',
        // authenticate: true
      })
      .state('restaurant-printers-edit', {
        params:{"navValue":"restaurant-printers-view"},
        url: '/restaurant/printers-edit/:id',
        templateUrl: 'app/restaurant/printer/printer-edit.html',
        controller: 'PrinterEditCtrl',
        controllerAs: 'printerEditCtrl',
        // authenticate: true
      })
      .state('restaurant-prints-view', {
        params:{"navValue":"restaurant-prints-view"},
        url: '/restaurant/prints-view',
        templateUrl: 'app/restaurant/print/print-view.html',
        controller: 'PrintViewCtrl',
        controllerAs: 'printViewCtrl',
        // authenticate: true
      });
      // .state('restaurant-printers-test', {
      //   params:{"navValue":"restaurant-printers-test"},
      //   url: '/restaurant/printers-test',
      //   templateUrl: 'app/restaurant/printer/printer-test.html',
      //   controller: 'PrinterCtrl',
      //   controllerAs: 'printerCtrl',
      //   // authenticate: true
      // });


  });