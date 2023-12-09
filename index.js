const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

//mongodb configure starts
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rmsb4ix.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const database = client.db("jobCategory");
    const bidedJobs = database.collection("bidedJobs");
    const addedJob = database.collection("addedJob");

    //getting graphics design data
    app.get("/jobs", async (req, res) => {
      const category = req.query.category;
      const query = { Job_Category: category };
      const result = await addedJob.find(query).toArray()
      res.send(result);
    });

    //getting a single graphics data
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addedJob.findOne(query);
      res.send(result);
    });

    //posting bided data for showing my bids page
    app.post("/bids", async (req, res) => {
      const addedBidedJob = req.body;
      const result = await bidedJobs.insertOne(addedBidedJob);
      res.send(result);
    });

    //getting all bided job for my bid page
    app.get("/myBids", async (req, res) => {
      const cursor = bidedJobs.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    //posting added job data for showing my posted jobs
    app.post("/addJob", async (req, res) => {
      const addJob = req.body;
      const result = await addedJob.insertOne(addJob);
      res.send(result);
    });

    //getting all added job for my posted job page
    app.get("/myPostedJobs", async (req, res) => {
      console.log(req.query.email);
      const query = { Buyer_Email: req.query.email };
      const result = await addedJob.find(query).toArray();
      res.send(result);
    });

    //deleting a job from the my posted job page
    app.delete("/myPostedJobs/:id", async (req, res) => {
      const id = req.params.id;
      console.log("pls delete the item of id :", id);
      const query = { _id: new ObjectId(id) };
      const result = await addedJob.deleteOne(query);
      res.send(result);
    });

    //getting a job post for update
    app.get("/updateJobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addedJob.findOne(query);
      res.send(result);
    });

    //updating a job from my posted job page
    app.put("/updateJobPost/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateJob = req.body;
      console.log(updateJob);
      const job = {
        $set: {
          Job_Category: updateJob.Job_Category,
          Job_Title: updateJob.Job_Title,
          Email: updateJob.Email,
          Deadline: updateJob.Deadline,
          Minimum_Price: updateJob.Minimum_Price,
          Maximum_Price: updateJob.Maximum_Price,
          Job_Description: updateJob.Job_Description,
        },
      };
      const result = await addedJob.updateOne(filter, job, options);
      console.log(result);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
//mongodb configure ends

app.get("/", (req, res) => {
  res.send("Hello Job Construction");
});

app.listen(port, () => {
  console.log(`Job construction app is running on port: ${port}`);
});
