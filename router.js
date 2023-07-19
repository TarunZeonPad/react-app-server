const express= require("express");
const AWS = require('aws-sdk');
const csv = require('csv-parser');


let s3 = new AWS.S3({
    region:"eu-north-1",
    accessKeyId:"AKIAR5AVMEEAFOVXJGPI",
    secretAccessKey:"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"
});
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



async function readData() {
    return new Promise(async (resolve, reject) => {
      // Get a reference to the collection
      const collection = db.collection(collectionName);
      const dataResponse = [];

      await collection.all().then(
        cursor => cursor.all()
      ).then(
        documents => documents.forEach(document => 
          { 
          let obj = {versionName:document.versionNum,email:document.createdBy,description:document.description,status:document.status};
          console.log("Inside document");
          console.log(obj);
          dataResponse.push(obj);
      }),
        err => console.error('Failed to fetch:', err)
      );

     

      resolve(dataResponse);
    });
  }

Router.get("/api/user",(req, res)=>{
    
    
	readData()
  .then(dataResponse => {
    console.log('Retrieved data array:');
    console.log(dataResponse);
    res.send(dataResponse);
  })
  .catch(error => {
    console.error('Error reading data:', error);
  })
  .finally(() => {
    // Close the ArangoDB connection
    //db.close();
  });
        
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
                versionNum: versionName,
                createdBy: email,
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

async function readDataFromS3() {
  return new Promise(async (resolve, reject) => {
    // Get a reference to the collection
    const results = [];
    await s3.getObject({
      Bucket:"msi-aspire-bucket",
      Key:"AWSS3_Data.csv"
  }, (error, data) => {
      if(error) {
          console.log(error);
      }else{
          const csvContent = data.Body.toString();
         console.log('File Content:\n', csvContent);
         
  
         const Readable = require('stream').Readable;
         const csvStream = new Readable({
          async read() {
          this.push(csvContent);
          this.push(null);
          },
          });
  
      csvStream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Process the CSV data
      console.log('CSV data:', results);

      const collection = db.collection("msi_s3_store");
        
            // Create a new document to insert
            
            
        
            // Insert the document into the collection
            const result = collection.insert(results);
    });
      }
  });

   

    resolve(results);
  });
}


Router.get("/api/s3arango/:filename", (req, res)=>{
    console.log('req.params.id '+req.params.filename);

    readDataFromS3()
  .then(dataResponse => {
    console.log('Retrieved csv data from s3:');
    console.log(dataResponse);
    const data=[{fileName:req.params.filename,content:dataResponse}];
    res.send(dataResponse);
  })
  .catch(error => {
    console.error('Error reading data:', error);
  })
  .finally(() => {
    // Close the ArangoDB connection
    //db.close();
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
