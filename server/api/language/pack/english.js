exports.edition = 'english';
//navbar
exports.navbar={
	restaurant:[{
		title: 'Order',
        state:'restaurant-orders-view',
        content:[{
          title:"Order",
          state:'restaurant-orders-view'
        },{
          title:"Statistic",
          state:'restaurant-statistic',
        },{
          title:"Integral",
          state:'restaurant-integral-add',
        }]
    },{
    	title: 'Manage',
        state:'restaurant-products-view',
        content:[{
        	title:"Product",
            state:'restaurant-products-view'
        },{
        	title:"Fish & Pot",
            state:'restaurant-pans-view'
        },{
        	title:"Taste",
            state:'restaurant-tastes-view'
        },{
        	title:"Table",
            state:'restaurant-tables-view'
		}
		// ,{
        // 	title:"Extra Pay",
        //     state:'restaurant-extras-view'
		// }
		,{
        	title:"Gift",
            state:'restaurant-gifts-view'
        }]
    },{
    	title: 'Waiter',
        state:'restaurant-waiter'
    },{
    	title: 'Customer',
        state:'restaurant-customers-view'
    },{
    	title: 'Printer',
        state:'restaurant-printers-view',
        content:[{
        	title:"Printer",
            state:'restaurant-printers-view'
        },{
        	title:"Print",
            state:'restaurant-prints-view'
        }]
    }],
	admin:[{
		title: '餐厅',
        state:'admin-restaurant-view'
    },{ 
		title: '用户',
        state:'admin-customer-view'
    }],
    user:{
    	setUp:'set up',
    	language:'英文/中文',
    	logout:'logout'
    }
};

//restaurant
exports.restaurant={
	order:{
		date:'Data',
		tableNumber:'Table Number',
		cost:'Cost',
		customer:'Customer',
		waiter:'Waiter',
		consumeDetail:'Order Detail',
		order:'Order',
		costTotal:'Cost',
		productTotal:'Product Total',
		pot:'Fish & Pot',
		total:'Total',
		serve:'Serve',
		taxation:'Taxation',
		totalPrice:'Total Price',
		costDetail:'Cost Detail',
		product:'Product',
		checkDetail:'Check Detail',
		discount:'Discount:',
		noOrder:'No order',
		notMember:'Not Member',
		print:'Print',
		printerErr:'Printer init failed',
		download:'Download'
	},
	statistic:{
		cashCost:"Cash consumption",
		cardCost:"Pay by card",
		discountCost:"Discount off the money",
		giveProducts:"Send food",
		orderCount:"Order count"
	},
	manage:{
		product:{
			product_view:{
				newDish:'Add',
				allDish:'All Product',
				search:'Search',
				addtime:'Create Time',
				price:'Price',
				temporaryNoName:'No Name',
				temporaryNoPrice:'No Price',
				temporaryNoNorms:'No Norms',
				temporaryNoStock:'No Stock',
				stock:'Stock',
				edit:'Edit',
				soldOn:'Sold On',
				off:'Off',
				sold:'Sold',
				editCategory:'Edit',
				soldOut:"Sold Out"
			},
			product_edit:{
				dishes:'Product',
				edit:'Edit',
				name:'Name',
				englishName:'English Name',
				norms:'Norms',
				englishNorms:'English Norms',
				price:'Price',
				stock:'Stock',
				classfy:'Classfy',
				photo:'Image',
				select:'Select',
				nor:'g/portion',
				pri:'$/portion',
				ableDiscount:"isAbleDistcount",
				discount:"ableDiscount",
				noDiscount:"noDiscount",
				deleteRemind:"Delete operation is irreversible operation, whether to continue?",
				deleteCategoryRemind:"Confirm delete:"
			},
			product_add:{
				dishes:'Product',
				add:'Add',
				name:'Name',
				englishName:'English Name',
				norms:'Norms',
				englishNorms:'English Norms',
				price:'Price',
				stock:'Stock',
				classfy:'Classfy',
				photo:'Image',
				select:'Select',
				nor:'g/portion',
				pri:'$/portion',
				ableDiscount:"isAbleDistcount",
				discount:"ableDiscount",
				noDiscount:"noDiscount",
				deleteCategoryRemind:"Confirm delete:"
			},
			categories:{
				dishes:'Product',
				editDishes:'Edit category',
				firstDishes:'First Dish',
				secondDishes:'Second Dish',
				edit:'Edit',
				order:'Sort',
				newDishes:'Add',
				name:'Name',
				englishName:'English Name',
				errorState:"State error, please add again!",
				nameError:"Please fill in the category name",
				nameEnglishError:"Please fill in Name",
				deleteRemind:"Delete operation is irreversible operation, whether to continue?"
			}
		},
		pan:{
			pot:'Category',
			soup:'List',
			newPot:'Add',
			newSoup:'Add',
			potName:'Name',
			potEnglishName:'English',
			total:'Total',
			price:'Price',
			potPhoto:'Image',
			soupName:'Name',
			soupEnglishName:'English Name',
			description:'Description',
			englishDescription:'English Description',
			soupPhoto:'Image',
			taste:'Tasty',
			selectTasty:'Select Tasty',
			selectSoup:'Select Soup taste',
			edit:'Edit',
			editSoup:'Edit',
			soldOn:'Sold On',
			soldOut:'Off',
			price:'Price',
			deleteRemind:"Delete operation is irreversible operation, whether to continue?"
		},
		table:{
			newTable:'Add',
			number:'Number',
			remark:'Remark',
			deleteRemind:"Delete operation is irreversible operation, whether to continue?"
		},
		extra:{
			newExtra:'Add Extra Pay',
			name:'name',
			englishName:'English Name',
			norms:'Norms',
			englishNorms:'English Norms',
			price:'Price',
			orSold:'Or Not Sold',
			soldOn:'Sold On',
			soldOut:'Sold Out',
			edit:'Edit',
			deleteRemind:"Delete operation is irreversible operation, whether to continue?"
		},
		gift:{
			gift:'Gift',
			newGift:'Add',
			name:'Name',
			englishName:'English',
			integralDemand:'Integral',
			stock:'stock',
			photo:'image',
			soldOn:'Sold On',
			soldOut:'Off',
			integral:'integral',
			edit:'Edit',
			deleteRemind:"Delete operation is irreversible operation, whether to continue?"
		}
	},
	waiter:{
		newWaiter:'Add',
		name:'Name',
		account:'Account',
		password:'Password',
		editPassword:'Edit Password',
		edit:'Edit',
		search:'Input Waiter Account',
		deleteRemind:"Delete operation is irreversible operation, whether to continue?",
		passwordNull:"password can\'t be null",
		editSuccess:"Eidt success"
	},
	customer:{
		consume:'Desc by consume',
		date:'Create Date',
		account:'Account',
		name:'Nickname',
		integral:'Accumulate Points',
		details:'Consume Detail',
		search:'Input Customer Account',
		consumeTime:'Time',
		consumePlace:'Place',
		consumers:'Consumers',
		consumer:'Consumer',
		consumeCost:'Cost',
		waiter:'Waiter',
		detail:'Detail',
		detailss:'Cost Detail',
		cost:'Cost',
	},
	integral:{
		customers:'Customer',
		integralDetail:'Integral Detail',
		consumeTime:'Consume Time',
		customer:'Customer',
		integral:'Integral',
		event:'Event',
		getIntegral:'Get Integral',
		exchangeIntegral:'Exchange Integral',
		consumptionIntegral:'Consumption Integral',
		extraPoints:'Extra Points'
	},
	consume:{
		productTotal:'Product Total',
		pot:'Fish & Pot',
		total:'Total',
		serve:'Serve',
		taxation:'Taxation',
		totalPrice:'Total Price',
		costDetail:'Cost Detail',
		product:'Product',
		checkDetail:'Check Detail',
		discount:'Discount'
	},
	personal:{
		notice:'Notice',
		restaurantNotice:'Restaurant notice',
		integralNotice:'Integral notice',
		changeIntegral:'Change integral',
		changePassword:'Change password',
		changeInfo:'Change info',
		consume:'Consume',
		oneDoller:'1 $',
		integral:'Integral',
		oldPassword:'Old',
		newPassword:'New',
		name:'Name',
		logo:'Logo',
		address:'Address',
		tel:'Tel',
		waiter:'Waiter!',
		success:'Success!',
		errPassword:'Error password!',
		gst:'Gst',
		service:'Service'
	},
	printer:{
		add:'Add',
		title:'Printer',
		addTitle:'Add',
		editTitle:'Edit',
		name:'Name:',
		nameRemind:'Please fill in the true name of the device',
		task:'Task:',
		order:'Order',
		panSoup:'PanSoup',
		product:'Product',
		isActive:'isActive:',
		active:'Active',
		printerInitErr:'init printer error:',
		defaultPrinterIniteErr:'Default printer init failed',
		printerInitErr:'init printer failed',
		autoPrint:'Open Autoprint',
		stopAutoPrint:'Stop Autoprint',
		errorCell:'Broadcast',
		changeList:'List',
		reInitPrinter:'reInitPrinter',
		rePrint:'rePrint',
		inAutoPrint:'Automatic play list, button is invalid',
		print:'Print',
		typeProduct:'Product',
		typePanSoup:'Pan And Soup',
		confirm:'confirm',
		unSupportLODOP:'请使用chrome41以下版本或其他浏览器,并安装Lodop控件(Please use the following chrome 41 versions or other browsers, and install Lodop control)'
	},
	common:{
		submitImg:'Submit Img'
	}
};

//admin
exports.admin={
	restaurant:{
		addRestaurant:'Add',
		name:'Restaurant Name',
		account:'Account',
		editPassword:'Edit Password',
		Password:'Password',
		search:'Input Restaurant Account',
		confirmPassword:'Confirm'
	},
	customer:{
		addCustomer:'Add',
		name:'Customer Name',
		account:'Account',
		password:'Password',
		editPassword:'Edit Password',
		edit:'Edit',
		search:'Input Customer Account',
		confirmPassword:'Confirm'
	}
};

//error
exports.error={
	admin:{

	},

	restaurant:{
		number:'Please input a number more than zero',
		gift:'Information Error(Integral Price or Quantity),Please Edit',
		product:'Information Error(Price or Stock),Please Edit',
		pan:'Information Error(Soup Total or Sub Total),Please Edit',
		extra:'Information Error(Price),Please Edit',
	},
	imageError:{
		compressError:"Compressed image failed, please try to upload again!"
	}
};

