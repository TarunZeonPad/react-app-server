const express= require("express");
const Router= express.Router();
const AmazonDaxClient = require('amazon-dax-client');
var AWS = require("aws-sdk");

var region = "eu-north-1";

AWS.config.update({
  region: region
});

var ddbClient = new AWS.DynamoDB.DocumentClient() 

var tableName = "msiversioningtest";

//const dbconnected= require("./dbconnection");
Router.get("/",(req, res)=>{
    const data=[{name:"David Test",email:"john007@gmail.com"}];
    res.send(data);
});
Router.get("/api/user",(req, res)=>{
    
    const data=[{versionName:"1.0",email:"systemi@metricstream.com",description:"This is dummy",status:1}];
	var params = {
                TableName: tableName
            };

	const scanResults = [];
    let items;
    do{
        items = ddbClient.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
    console.log(scanResults);
	
	scanResults.forEach( element => console.log(element))

	
	
    res.send(data);
});

Router.post("/api/addversion", (req, res)=>{
    const versionName= req.body.versionName;
    const email= req.body.email;
    const description= req.body.description;
    const status= req.body.status;
	var params = {
            TableName: tableName,
            Item: {
                "versionNum": versionName,
                "createdBy": email,
                "description": description,
				"status":status
            }
        };

        //
        //put item

        ddbClient.put(params, function(err, data) {
            if (err) {
               console.error("Unable to write data: ", JSON.stringify(err, null, 2));
            } else {
               res.status(200).json({success:"Version Record Inseted Successfully"});
            }
        });
    
});
Router.get("/api/edituser/:id", (req, res)=>{
    dbconnected.query("select * from tbl_user where userid='"+ req.params.id+"' ",(err, rows)=>{
      if(!err)
      {
         res.send(rows[0]);
      } else{
        console.log(err);
      }
    });
});
Router.put("/api/updateuser/:id", (req, res)=>{
    const userdata=[req.body.username, req.body.email, req.body.phone, req.body.address, req.body.status];
    var sql= "UPDATE tbl_user SET username=?, email=?, phone=?, address=?, status=? where userid='"+ req.params.id+"' ";
    dbconnected.query(sql, userdata,(err, result)=>{
        if(!err)
        {
        res.status(200).json({success:"User Record Updated successfully"});
        } else{
            console.log(err);
        }
    });
});


module.exports= Router;
