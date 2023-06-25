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
    
    
	var params = {
                TableName: tableName
            };

	var tableName = "msiversioningtest";

            var params = {
                TableName: tableName
				
            };

            ddbClient.scan(params, function(err, data) {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
					res.json(JSON.stringify(err, null, 2));
                } else {
					let dataResponse=[];
					console.log(data.Items);
					var parsedJSON = data.Items;
					for (var i=0;i<parsedJSON.length;i++) {
						console.log(parsedJSON[i]);
						let obj = {versionName:parsedJSON[i].versionNum,email:parsedJSON[i].createdBy,description:parsedJSON[i].description,status:parsedJSON[i].status};
						console.log(obj);
						dataResponse.push(obj);
					}
                    //res.json(JSON.stringify(data));
					res.send(dataResponse);
                }
            });


	
	
    //res.send(data);
});

Router.post("/api/addversion", (req, res)=>{
    const versionName= req.body.versionName;
    const email= req.body.email;
    const description= req.body.description;
    const status= req.body.status;
	var params = {
            TableName: tableName,
            Item: {
                "versionNum": parseInt(versionName),
                "createdBy": parseInt(email),
                "description": description,
				"status":status
            }
        };

        //
        //put item

        ddbClient.put(params, function(err, data) {
            if (err) {
               console.error("Unable to write data: ", JSON.stringify(err, null, 2));
			   res.status(500).json(JSON.stringify(err, null, 2));
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
