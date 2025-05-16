// routes/lifterRoutes.js
const express = require('express');
const router = express.Router();
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
const databaseName = "CMSC335DB";
const collectionName = "lifters";

// Home page
router.get("/", (req, res) => {
    res.render("index.ejs");
});

// Form to calculate 1RM
router.get("/calculate", (req, res) => {
    res.render("specifyRepMax.ejs");
});

router.post("/calculate", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);
        const lifter = {
            name: req.body.name,
            email: req.body.email,
            lift: req.body.lift,
            max: req.body.weight * (1 + req.body.reps / 30)
        };
        await collection.insertOne(lifter);
        res.render("displayMax.ejs", lifter);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

// Review lifter's max
router.get("/review", (req, res) => {
    res.render("reviewMax.ejs");
});

router.post("/review", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);
        const result = await collection.findOne({ email: req.body.email });
        const variables = result
            ? result
            : { name: "N/A", email: "N/A", lift: "N/A", max: "N/A" };
        res.render("displayMax.ejs", variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

// Remove all lifters
router.get("/remove", (req, res) => {
    res.render("removeLifters.ejs");
});

router.post("/remove", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany({});
        res.render("confirmRemoval.ejs", { numRemoved: result.deletedCount });
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

module.exports = router;
