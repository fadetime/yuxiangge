'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var WaiterSchema = new Schema({
	_restaurant:{
		type:String,
		ref:"Restaurant"
	},
	name:String,
	// authPassword:String,//口令
	serviceTables:[{
		type:String,
		ref:"Table"
	}],
	createDate:Date
});

module.exports = mongoose.model('Waiter', WaiterSchema);