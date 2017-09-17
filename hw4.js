
//待解决：改了username后马上再重新update就update补了了
//query error后面该return还是return json检查一下
//记得purchase和recomm table加key
/*js array，一般用xxlist.push()加element但也可以用xxarray[xxarray.length]=sth加. access array用index。 好像js里没有list。
json内部是没顺序的,即要认为用for loop得到的key不一定按顺序的。只是browser返回的时候为了让它不那么random所以会设置让它按某种顺序而已。但json内部本身没顺序。想要顺序
只能放到array里再去sort array
 { a:1, b:2 } 就是 { b:2, a:1 }  所以loop key时候必须用 Object.keys(xxx).forEach(function(k){}) 
JSON is just a notation，不是JavaScript Object, 需要用 stringify 把 JavaScript Object change to JSON，反过来就用parse把JSON换成Js obj:  var obj = JSON.parse(jsonStr)

JSON里有几个key需要用Object.keys(some_json).length; array长度才可以直接用some_array.length
*/

var express = require('express');
var path = require('path');
var session1 = require('cookie-session');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongo = require('mongodb').MongoClient;  //是mongoClient object
//var assert = require('assert');
//var winston = require('winston');


var app = express();  
var router = express.Router();  

//var url = 'mongodb://localhost:27017/test'; 

var url = 'mongodb://yyl:yunyinliu@hw4cluster-shard-00-00-sfg89.mongodb.net:27017,hw4cluster-shard-00-01-sfg89.mongodb.net:27017,hw4cluster-shard-00-02-sfg89.mongodb.net:27017/test?ssl=true&replicaSet=hw4cluster-shard-0&authSource=admin'

var dbconn;
mongo.connect(url, {poolSize: 3000},function(err, db) {
    if (err) {
    	console.log(err+"error connecting to db");

    } else {
    	app.listen(8080); 
		console.log('Magic happens on port 8080');
    	dbconn=db;
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(session1({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 15 * 60 * 1000
}))

router.post('/registerUser', function(req, res) {

	req.checkBody('fname','first name is empty').notEmpty();
	req.checkBody('lname', 'last name is empty').notEmpty();
	req.checkBody('address', 'address is empty').notEmpty();
	req.checkBody('city', 'city is empty').notEmpty();
	req.checkBody('state', 'state is invalid').notEmpty()
	req.checkBody('zip', 'zip is invalid').notEmpty()
	req.checkBody('email', 'email is empty').notEmpty();
	req.checkBody('username', 'username is empty').notEmpty();
	req.checkBody('password', 'password is empty').notEmpty();	
	req.getValidationResult().then(function(result) {

	  	if(result.isEmpty()) { 

			var item = {
				fname: req.body.fname,
				lname: req.body.lname,
				address:req.body.address,
				city:req.body.city,
				state:req.body.state,
				zip:req.body.zip,
				email:req.body.email,
				username:req.body.username,
				password:req.body.password,						
			}
			dbconn.collection('users').insertOne(item,function(err,result){
				//console.log("closing db connection for registerUser..");
				//db.close();
				if(err){
					console.log("Error of "+err.message+" at "+req.originalUrl+" page.");
					return res.json({"message":"The input you provided is not valid"}); //因为username dup了会来这。
				} else {
					return res.json({"message":req.body.fname + " was registered successfully"});
				}
			});

	  	} else {
	  		console.log(result.array()) //会把error都print出： [  {param: "email", msg: "自己写的msg", value: "<received input>"},{..} ]
	  		return res.json({"message":"The input you provided is not valid"});
	  	}
	});
})





router.post('/addProducts', function(req, res) {
	req.checkBody('asin','asin is empty').notEmpty();  
	req.checkBody('productName', 'productName is empty').notEmpty();
	req.checkBody('productDescription', 'productDescription is empty').notEmpty();
	req.checkBody('group', 'group is empty').notEmpty();

	req.getValidationResult().then(function(result) {
	  	if(result.isEmpty()) { 
			var item = {
				asin: req.body.asin,
				productName: req.body.productName,
				productDescription:req.body.productDescription,
				group:req.body.group,
			}	

			dbconn.collection('products').findOne({"asin":req.body.asin},function(err,result){
				if(err){
					console.log("Error of "+err.message+" at "+req.originalUrl+" page: checking dup")
					return;
				} else if(rows.length){
					console.log("ASIN already exists.");
					return res.json({"message":"The input you provided is not valid"});
				} else {
					dbconn.collection('products').insertOne(item,function(err,result){
						if(err){
							console.log("Error of "+err.message+" at "+req.originalUrl+" page.aft check dup")
							return res.json({"message":"The input you provided is not valid"});
						} else {
							return res.json({"message":req.body.productName + " was successfully added to the system"});
						}
					});
				}
			})

	  	} else {
	  		console.log(result.array()) 
	  		return res.json({"message":"The input you provided is not valid"});
	  	}
	});
})


//之前如果没改的param用现在这个user的。这里改成把改的存在list里。
router.post('/updateInfo', function(req, res) {

	var curUsername = req.session.user.username;
	var item = {};
	var fname=req.session.user.fname;

	if (typeof req.body.fname !== 'undefined' && req.body.fname !== ""){
		item["fname"]=req.body.fname;
		fname = req.body.fname;
	}

	if (typeof req.body.lname !== 'undefined' && req.body.lname !== "")
		item["lname"]=req.body.lname;

	if (typeof req.body.address !== 'undefined' && req.body.address !== "")
		item["address"]=req.body.address;

	if (typeof req.body.city !== 'undefined' && req.body.city !== "")
		item["city"]=req.body.city;

	if (typeof req.body.state !== 'undefined' && req.body.state !== "")
		item["state"]=req.body.state;

	if (typeof req.body.zip !== 'undefined' && req.body.zip !== "")
		item["zip"]=req.body.zip;

	if (typeof req.body.email !== 'undefined' && req.body.email !== "")
		item["email"]=req.body.email;

	if (typeof req.body.username !== 'undefined' && req.body.username !== "")
		item["username"]=req.body.username;

	if (typeof req.body.password !== 'undefined' && req.body.password !== "")
		item["password"]=req.body.password;

	console.log(item);
//如果user改了username后不重新login就再/updateInfo，这样会update 0条（因为user不存在了）但会显示update成功。(试图改成duplicate的username时候不会真的改但是显示改成功)
	dbconn.collection("users").updateOne({"username":curUsername},{$set: item}, function(err,result){
		if(err){
			console.log("Error of "+err.message+" at "+req.originalUrl+" page.")
			return res.json({"message":"The input you provided is not valid"});
		} else {
			//console.log(item.username+" " +item.password);
			return res.json({"message": fname+" your information was successfully updated"});
		}
	})
});


//})


router.post('/modifyProduct', function(req, res) {

	req.checkBody('asin', 'asin is empty').notEmpty(); 
	req.checkBody('productName', 'productName is empty').notEmpty(); 
	req.checkBody('productDescription', 'productDescription is empty').notEmpty(); 
	req.checkBody('group', 'group is empty').notEmpty(); 

	req.getValidationResult().then(function(result) {
	  	if(result.isEmpty()) {  
	  		dbconn.collection("products").findOne({"asin":req.body.asin},function(err,result){
	  			if(err){
					console.log("Error of "+err.message+" at "+req.originalUrl+" page. Checking if the asin exists.")
	  			} else if (result === null) {
	  				console.log('modify a product that is not in the system');
	  				return res.json({"message":"The input you provided is not valid"});
	  			} else {
	  				item = {"productName":req.body.productName,"productDescription":req.body.productDescription,"group":req.body.group}
	  				dbconn.collection("products").update({"asin":req.body.asin},{$set:item},function(err,result){
	  					if (err){
	  						console.log("Error of "+err.message+" at "+req.originalUrl+" page. Updating the record.")
	  						return;
	  					} else {
	  						return res.json({"message": req.body.productName + " was successfully updated"});
	  					}
	  				})
	  			}
	  		})
	  	} else {
	  		console.log(result.array()) //会把error都print出： [  {param: "email", msg: "自己写的msg", value: "<received input>"},{..} ]
			return res.json({"message":"The input you provided is not valid"});
	  	}
	});
})



router.post('/viewUsers',function(req,res){
	var fname = req.body.fname;
	var lname = req.body.lname;
	var item = {};

	if ((typeof fname !=='undefined') && (fname!==''))
		item["fname"] = {'$regex': fname};

	if ((typeof lname !=='undefined') && (lname!==''))
		item["lname"] = {'$regex': lname};

	console.log("The user's searching criteria for "+req.originalUrl+" is: "+item);
	dbconn.collection("users").aggregate([{$match:item},{$project:{"_id":0,fname:1,lname:1,userId:"$username"}}]).toArray(function(err,result){
		if(err){
			console.log("Error of "+err.message+" at "+req.originalUrl+" page.")
			return;
		}else{
			if (result.length === 0) {
				return res.json({"message":"There are no users that match that criteria"});
			} else {
				return res.json({"message":"The action was successful", "user":result});
			}
		}

	});
/*
	dbconn.collection("users").find(item,{fname:1,lname:1,username:1}).toArray(function(err,result){
		if(err){
			console.log("Error of "+err.message+" at "+req.originalUrl+" page.")
		}else{
			return res.json({"message":"The action was successful", "user":result});
		}

	}); 
*/

})


router.post('/viewProducts',function(req,res){
	var asin = req.body.asin
	var keyword = req.body.keyword
	var group = req.body.group
	var textsearch={};
	var asinOn = false;
	var groupOn = false;
	var keywordOn = false;
	var whichCollection;
	var searchText = false;
	var item = {};
	//var cons = []
	//item["$and"]=cons;
	//var alltext = ""
	//var countAltext =0;


	//find({year: 2015, $text: {$search: "cats"}}

	console.log("asin is: "+asin);
	if ((typeof asin !=='undefined') && (asin!=='')){		
		//alltext+="\""+asin+"\" ";
		//countAltext+=1;
		asinOn = true;
		//cons.push({"asin":asin});
	}	

	if ((typeof group !=='undefined') && (group!=='')){
		//alltext+="\""+group+"\" ";
		//countAltext+=1;	
		//item["group"] = group;
		groupOn = true;
		//cons.push({"group":group});
	}
		

	if ((typeof keyword !=='undefined') && (keyword!=='')) {
		//alltext+="\""+keyword+"\"";
		keywordOn= true;
		
		
		//cons.push({"$or":[{"productName":{'$regex': keyword}},{"productDescription":{'$regex': keyword}}]});
	}

	//if (countAltext >0)
	//	textsearch["$search"] = alltext;
	console.log("asin: "+asin+" group: "+group+" keyword: "+keyword);
	if (asinOn){
		console.log("has asin.");
		whichCollection = "products";
		item["asin"]= asin;
	} else {
		if (groupOn && keywordOn){
			console.log("group and keyword");
			whichCollection = "products_g";
			textsearch["$search"] = "\""+keyword+"\"";
			item["$text"] = textsearch;
			item["score"] = { $meta: "textScore" };
			item["group"]= group;
			searchText = true;
		} else if (groupOn && (!keywordOn)){
			console.log("only group");
			whichCollection = "products_g";
			item["group"] = group;			
		} else if(keywordOn && (!groupOn)) {
			console.log("only keyword");
			whichCollection = "products_k";
			textsearch["$search"] = "\""+keyword+"\"";
			item["score"] = { $meta: "textScore" };
			item["$text"] = textsearch;
			searchText = true;

		} else {
			console.log("return all");
			whichCollection = "products";
			item = {};
		}
	}

	console.log("querying collection: "+whichCollection);
	console.log("The user's searching criteria for "+req.originalUrl+" is: "+JSON.stringify(item));
	if (searchText) {
		dbconn.collection(whichCollection).find(item,{"_id":0,asin:1,productName:1}).toArray(function(err,result){
			if(err){
				console.log("Error of "+err.message+" at "+req.originalUrl+" page.");
				return;
			}else{
				if (result.length === 0) {
					return res.json({"message":"There are no products that match that criteria"});
				} else {
					return res.json({"product":result});
				}		
			}
		});
	} else {
		dbconn.collection(whichCollection).find(item,{"_id":0,asin:1,productName:1}).sort( { score: { $meta: "textScore" } }).toArray(function(err,result){
			if(err){
				console.log("Error of "+err.message+" at "+req.originalUrl+" page.");
				return;
			}else{
				if (result.length === 0) {
					return res.json({"message":"There are no products that match that criteria"});
				} else {
					return res.json({"product":result});
				}		
			}
		});




	}
})


router.post('/buyProducts',function(req,res){
	var allAsin = req.body.products; //[{“asin”: “asin”}, {“asin”: “asin”}, …]
	var user = req.session.user;
	console.log("allAsin: "+JSON.stringify(allAsin));
//	var purchaseEntry= {};  //{"username":username,“products”:[{“productName”: “product name”, “quantity”: “quantity purchased”},{},...]}
	var completed=0;
	var curASIN;
//	var listProductName=[];
	var lenAsin = allAsin.length; //user填了几个asin（包含重复）
	var allASINjson={}; //去掉重复  {some_asin: count, some_asin:count,...}  
	var inc_purchase = {};  //{some_producName: count, some_productName:count,...}

	//for loop get all productNames from asins
	for (var i = 0; i<lenAsin; i++) {  //i is {“asin”: “asin”}
		curASIN = allAsin[i].asin;	
		console.log("current ASIN is: "+curASIN);

		//找到每个asin对应的productName
		dbconn.collection('products').findOne({"asin":curASIN},{"productName":1,"asin":1,"_id":0},function(err,result){		
			//console.log("xx");
			if(err){
				console.log("Error of "+err.message+" at "+req.originalUrl+" page. Find productName of each asin.")
				return;
			} else {	 
				//下面如果不用result.asin而用curASIN，则curASIN的值就变成了执行到这里时候curASIN当时的值，而不是执行刚才findOne时候curASIN的值了。
				//或者可以把curASIN传进5行之前的callback么??
				//这个bug很要命
				//console.log("yy");
				if (result===null) {
					console.log("result.asin does not refer to an existing product");
					return res.json({"message": "There are no products that match that criteria"});					
				}

				console.log("The user's searched asin "+result.asin+" at page "+req.originalUrl+" returns a product: "+JSON.stringify(result));

				var dotPos = result.productName.indexOf("."); 
				if (dotPos > 0) {   //找不到是-1不是null所以不能if (dotPos)
					//replace dot symbols to Unicode equivalent of \uff0E (是中文的dot，占两个字符。如果用ASCII dot还是和用.一样)
					result.productName = result.productName.replace(/\./g , "\uff0E");
					//result.productName = [result.productName.slice(0, dotPos), '\uff0E', result.productName.slice(dotPos+1)].join('')
				}

				if (("products."+result.productName) in inc_purchase) { //注意啥时候用[]啥时候不用呢？[]作用是把variable括起来不让variable被当成了string					
					inc_purchase["products."+result.productName] += 1;
					//没先建好inc_purchase里的products，这里存进的就是inc_purchase become: {"products.My Fair Pastry (Good Eats Vol. 9)":1}
					//到后面的$inc时候products会被interpret，但是product名里本身的dot也被interpret
					allASINjson[result.asin] += 1;
				} else {
					inc_purchase["products."+result.productName]=1;
					//listProductName.push(result["productName"]);
					allASINjson[result.asin]=1; 					
				}

				completed ++;
				console.log("Number of completion of find productNames from given ASIN is: "+ completed);
				console.log("inc_purchase become: "+ JSON.stringify(inc_purchase));
				console.log("allASINjson become: "+ JSON.stringify(allASINjson));

				//console.log("Object.keys(inc_purchase).length: "+ Object.keys(inc_purchase).length);

				//每个asin对应的productName都找到了，才会进入下面的if。进入下面的if已经是之前for loop的最后一个loop了。
				//这时有了一个allASINjson存着所有不重复的asin和其count;还有个listProductName的list存着所有不重复的productName
				if (completed=== lenAsin) {

					console.log("-------------Finding productName for each asin are all completed.--------------");
					completed = 0;

					//如果这时只买了一个产品，就不update recommendation table了，因为{$inc: inc_recommend}这里如果inc_recommend是{}就会query error。
					if (Object.keys(allASINjson).length === 1){
						console.log("Only bought one product. So now we will update purchase table only.");
						//下面这里完全是copy的。怎样引用
						dbconn.collection("purchase").update({"username":user.username},{$inc: inc_purchase},{upsert: true},function(err,result){		
							if(err){
								console.log("Error of "+err.message+" at "+req.originalUrl+" page. Insert to purchase table.")
								return;
							} else {
								console.log("update purchase table is completed.");
								return res.json({"message":"The action was successful"});
							}
						})
					} else { //不能不写else，否则因为前面的if里有async，下面会被执行的
						//对于某一个asin，把同时purchase的另外几个asin加进recommendation table。每个request有几个不重复asin，recommend table就加几行。
						//而后面purchase table每个req只加一行进去
						Object.keys(allASINjson).forEach(function(k1) {

							var inc_recommend = {};  //{some_asin: count, some_asin:count,...}

							Object.keys(allASINjson).forEach(function(k2) {
								if (k2 !== k1)
									inc_recommend["products."+k2]=1;
							})

							console.log("Now ASIN is "+k1+" , its inc_recommend become: "+ JSON.stringify(inc_recommend));

							dbconn.collection("recommendation").update({"asin":k1},{$inc: inc_recommend},{upsert: true},function(err,result){		
								//$inc: {"products.nice thing": 1 }},{upsert: true},function(err,result){
								if(err){
									console.log("Query Error!: "+err.message+" . At "+req.originalUrl+" page. Insert to recommendation table.");
									return;//??这里写了return，但是postman并没有return而是一直干等着
								} else {
									console.log("successfully updated recommendation for asin: "+k1);  //why全都loop完了这里一起执行
									
									completed+=1;
									console.log("update recommendation table - number of completion is: "+completed);

									//下面发生时allASINjson已经到了最后一个loop,即下面if里的只会被执行一遍
									if(completed===Object.keys(allASINjson).length){
										console.log("--------------update recommendation table for all ASINs are completed.-------------");
										//completed = 0;

										//让下面的update purchase table发生在update完recommend table之后，因为怕recommendation没更新完purchase就先更新完了，
										//因为purchase 更新完了就return res.json了
										//inc_purchase是最开始就更新好了的
										dbconn.collection("purchase").update({"username":user.username},{$inc: inc_purchase},{upsert: true},function(err,result){		
											//$inc: {"products.nice thing": 1 }},{upsert: true},function(err,result){
											if(err){
												console.log("Error of "+err.message+" at "+req.originalUrl+" page. Insert to purchase table.")
												return;
											} else {
												//因为每个req就加一行进purchase table所以不用再计算completed了。
												//console.log("updated purchase table for asin: "+curASIN);  //why全都loop完了这里一起执行
												//completed+=1;
												//console.log("update purchase table - number of completed is: "completed);
												//if(completed===lenAsin){
												console.log("update purchase table is completed.");
												return res.json({"message":"The action was successful"});
											}
										})
									}
								}
							})
						})

					}
				}
/*				dbconn.collection("purchase").update({"username":user.username},{
					$inc: {["products."+result.productName]: 1 }},{upsert: true},function(err,result){
					//$inc: {"products.nice thing": 1 }},{upsert: true},function(err,result){
					if(err){
						console.log("Error of "+err.message+" at "+req.originalUrl+" page. Insert to purchase table.")
						return;
					} else {
						console.log("successfully bought asin: "+curASIN);  //why全都loop完了这里一起执行
						bought+=1;
						if(bought===lenAsin){
							return res.json({"message":"The action was successful"});
						}
					}
				})
*/
			} 
		})
	}


})
/*

记得加asin不存在的情况{“message”: “There are no products that match that criteria”}

出现了这种情况
> db.purchase.find()
{ "_id" : ObjectId("5971706a83ead43fb3690c87"), "username" : "jadmin", "book1" : 1 }
{ "_id" : ObjectId("5971706a83ead43fb3690c89"), "username" : "jadmin", "book3" : 1 }
{ "_id" : ObjectId("5971706a83ead43fb3690c88"), "username" : "jadmin", "book2" : 1 }
> db.purchase.find()
{ "_id" : ObjectId("5971706a83ead43fb3690c87"), "username" : "jadmin", "book1" : 2, "book2" : 1, "book3" : 1 }
{ "_id" : ObjectId("5971706a83ead43fb3690c89"), "username" : "jadmin", "book3" : 1 }
{ "_id" : ObjectId("5971706a83ead43fb3690c88"), "username" : "jadmin", "book2" : 1 }
*/



router.post('/productsPurchased', function(req, res) {

	req.checkBody('username','username is empty').notEmpty();  

	req.getValidationResult().then(function(result) {
	  	if(result.isEmpty()) { 
			console.log("what happen at productsPurchased");
			dbconn.collection('purchase').findOne({"username":req.body.username},{"_id":0,"username":0},function(err,result){
				if(err){
					console.log("Error of "+err.message+" at "+req.originalUrl+" page.")
					return; 
				} else {
					//result.products is { "book88" : 2, "book99" : 1, "book2" : 1 }
					//{"username":username,“products”:[{“productName”: “product name”, “quantity”: “quantity purchased”},{},...]}
					
					if (result === null)
						return res.json({"message": "There are no users that match that criteria"});

					var temp = [];
					var tempRes = {};
					var k1;
					//var cnt = 0;
					tempRes["message"]="The action was successful";

					Object.keys(result.products).forEach(function(k){
						var dotPos2 = k.indexOf("\uff0E");
						if (dotPos2>0){
							k1 = k.replace(/\uff0E/g , '.');
							//k = [k.slice(0, dotPos2), '.', k.slice(dotPos2+1)].join('')
						} else {
							k1=k;
						}
						//console.log("see this******"+)
						temp.push({"productName":k1,"quantity":result.products[k]});
						//console.log("here: "+JSON.stringify(temp));
					});

					tempRes["products"]=temp;

					console.log("final: "+JSON.stringify(tempRes));
					return res.json(tempRes);
				}
			});
	  	} else {
	  		console.log(result.array()) 
	  		return res.json({"message":"The input you provided is not valid"});
	  	}
	});
})




router.post('/getRecommendations', function(req, res) {

			dbconn.collection('recommendation').findOne({"asin":req.body.asin},{"_id":0},function(err,result){
				if(err){
					console.log("Error of "+err.message+" at "+req.originalUrl+" page.")
					return; 
				} else {

					if (result === null)
						return res.json({"message": "There are no recommendations for that product"});
					
					console.log("all recommended products raw data is: "+JSON.stringify(result));

					var sort_array = [];
					//var sort_array_asin = [];

					//这个for可能不对
					for (var key in result.products){
						sort_array.push({key:key,cnt:result.products[key]}) //[{key:some_asin,cnt:count},{key:some_asin,cnt:count},..]
					}

					var tempRes = {};
					var tempList = [];
					tempRes["message"]="The action was successful";

					//decending sort array of JavaScript object 
					sort_array.sort(function(x,y){return y.cnt - x.cnt});
					console.log("After sorting the recommended products are: "+JSON.stringify(result));


					if ( sort_array.length >5 ){
						for (var i=0; i<5; i++){
							tempList.push({"asin":sort_array[i].key});
						}
					} else {
						for (var i=0; i<sort_array.length; i++){
							tempList.push({"asin":sort_array[i].key});
						}
					}

					tempRes["products"]=tempList;

					return res.json(tempRes);
				}
			});

});




router.post('/login', function(req, res) {
	if(!req.body.username || !req.body.password){
		return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
	}
	console.log("whats wrong ");
	//用findOne return 1 doc, 用find return a cursor
	dbconn.collection('users').findOne({"username":req.body.username},function(err,result){
		console.log("login: "+JSON.stringify(result));
		if(err){
			console.log("Error of "+err.message+" at "+req.originalUrl+" page.");
			return;
		} else {
			if (result && result.password === req.body.password){
				req.session.user = result;
				console.log("give session to user: "+ req.session.user);
				return res.json({"message":"Welcome " + result.fname});
			} else {
				console.log("The user not exist or password is incorrect.")
				return res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
			}
		}				
	})
})



router.post('/logout', function(req, res) {
	req.session = null
    return res.json({"message":"You have been successfully logged out"});
});




app.use(function (req, res, next) {

	console.log("see which page user request: "+user);
    var url = req.originalUrl;
    if (url != "/login" && url != "/registerUser" && url != "/viewProducts" && !req.session.user) {
        
        return res.json({"message":"You are not currently logged in"});
    }

    var user = req.session.user; 
    console.log("2see which page user request: "+user);

    if (url == "/addProducts" || url == "/modifyProduct" || url == "/viewUsers" || url == "/productsPurchased") {
    	if (!("isadmin" in user)){
    		return res.json({"message":"You must be an admin to perform this action"});    		
    	}
    }
    console.log("authenticated user when connecting to "+url);

    next();
});




app.use('/', router);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');

});



