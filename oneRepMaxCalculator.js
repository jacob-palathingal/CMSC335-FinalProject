const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const portNumber = 3000;
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env')})

const uri = process.env.MONGO_CONNECTION_STRING;

const {MongoClient, ServerApiVersion } = require('mongodb');

const databaseName = "CMSC335DB";
const collectionName = "lifters";
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1});

app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);
process.stdout.write("Stop to shutdown the server: ");
process.stdin.setEncoding("utf8");
process.stdin.on('readable', () => {
    const dataInput = process.stdin.read();
    if(dataInput !== null){
        const command = dataInput.trim();
        if(command === "stop"){
            process.stdout.write("Shutting down the server");
            process.exit(0);
        }else{
            console.log(`Invalid command: ${command}`);
        }
        process.stdin.resume();
        process.stdout.write("Stop to shutdown the server: ");
    }
})

app.set("view engine", "ejs");

app.set("views", path.resolve(__dirname, "templates"));

app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/calculate", (req, res) => {
    res.render("specifyRepMax.ejs");
});

app.post("/calculate", (req, res) => {
    async function main(){
        try{
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);

            const lifter = {name: req.body.name, email: req.body.email, lift: req.body.lift, max: (req.body.weight * (1+req.body.reps/30))};
            await collection.insertOne(lifter);
            res.render("displayMax.ejs", lifter);
        }catch(e){
            console.error(e);
        } finally {
            await client.close();
        }
    }
    main();
});

app.get("/review", (req, res) => {
    res.render("reviewMax.ejs");
});

app.post("/review", (req, res) => {
    async function main(){
        try{
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
            let filter = {email: req.body.email};
            const result = await collection.findOne(filter);
            if(result){
                const variables = {name: result.name, email: result.email, lift: result.lift, max: result.max}
                res.render("displayMax.ejs", variables);
            }else{
                const variables = {name: "N/A", email: "N/A", lift: "N/A", reps: "N/A"};
                res.render("displayMax.ejs", variables);
            }
        }catch(e){
            console.error(e);
        } finally{
            await client.close();
        }
    }
    main();
});

app.get("/remove", (req, res) => {
    res.render("removeLifters.ejs");
});

app.post("/remove", (req, res) => {
    async function main(){
        try{
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
            let filter = {};
            const result = await collection.deleteMany(filter);
            variable = {numRemoved: result.deletedCount};
            res.render("confirmRemoval.ejs", variable);
        }catch(e){
            console.error(e);
        }finally{
            await client.close();
        }
    }
    main();
});