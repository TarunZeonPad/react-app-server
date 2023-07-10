const express= require("express");
const Router= express.Router();
//const AmazonDaxClient = require('amazon-dax-client');
//var AWS = require("aws-sdk");

//var region = "eu-north-1";

/*AWS.config.update({
  region: region
});*/

//var ddbClient = new AWS.DynamoDB.DocumentClient() 

//var tableName = "msiversioningtest";


const arangojs = require('arangojs');
const collectionName = 'msiVersionCollection';


// Create a new ArangoDB connection
const db = new arangojs.Database({
    url: 'http://172.31.34.233:8529',
    databaseName: 'msidb'
  });
  db.useBasicAuth('root', 'welcome*123');

//const dbconnected= require("./dbconnection");
Router.get("/",(req, res)=>{
    const data=[{name:"David Test",email:"john007@gmail.com"}];
    res.send(data);
});
Router.get("/api/user",(req, res)=>{
    
    
	

	var tableName = "msiversioningtest";

    try {
        // Get a reference to the collection
        const collection = db.collection(collectionName);
    
        // Execute a query to retrieve all documents in the collection
        
    
        // Initialize an array to store the retrieved documents
        
        const dataResponse = [];
collection.all().then(
  cursor => cursor.all()
).then(
  documents => documents.forEach(document => 
    { 
    let obj = {versionName:document.versionNum,email:document.createdBy,description:document.description,status:document.status};
    console.log(obj);
    dataResponse.push(obj);
    res.send(dataResponse);
}),
  err => console.error('Failed to fetch:', err)
);
    
        // Iterate over the cursor and push documents into the array
        /*cursor.each((document) => {
          let obj = {versionName:document.versionNum,email:document.createdBy,description:document.description,status:document.status};
		 console.log(obj);
		 dataResponse.push(obj);
        });
        */
        // Output the retrieved documents as a JSON array
        //console.log(JSON.stringify(dataResponse, null, 2));
        console.log(dataResponse);
        res.send(dataResponse);
      } catch (error) {
        console.error('Error reading data:', error);
      }

           /* var params = {
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
            });*/

           
	
	
    //res.send(data);
});

Router.post("/api/addversion", (req, res)=>{
    const versionName= req.body.versionName;
    const email= req.body.email;
    const description= req.body.description;
    const status= req.body.status;
	/*var params = {
            TableName: tableName,
            Item: {
                "versionNum": parseInt(versionName),
                "createdBy": parseInt(email),
                "description": description,
				"status":status
            }
        };

       
        ddbClient.put(params, function(err, data) {
            if (err) {
               console.error("Unable to write data: ", JSON.stringify(err, null, 2));
			   res.status(500).json(JSON.stringify(err, null, 2));
            } else {
               res.status(200).json({success:"Version Record Inseted Successfully"});
            }
        });*/
        try {
            // Get a reference to the collection
            const collection = db.collection(collectionName);
        
            // Create a new document to insert
            const document = {
                versionNum: parseInt(versionName),
                createdBy: parseInt(email),
                description: description,
				status:status
            };
        
            // Insert the document into the collection
            const result = collection.save(document);
        
            // Output the inserted document
            console.log('Inserted document:');
            console.log(result);
            res.status(200).json({success:"Version Record Inseted Successfully"});
          } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).json(JSON.stringify(error, null, 2));
          }
    
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
