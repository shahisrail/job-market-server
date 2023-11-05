const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middalwre
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://Assaignment-11:3jIDCzzgWcg78wdH@cluster0.bkdyuro.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let Addjobs; // Declare the Addjobs variable at a higher scope

async function run() {
  try {
    await client.connect();
    Addjobs = client.db("Jobmarket").collection('Addjobs');

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/cart', async (req, res) => {
  const carts = req.body;
  const result = await Addjobs.insertOne(carts);
  res.send(result);
});

app.get('/cart', async (req, res) => {
  const cursor = Addjobs.find();
  const result = await cursor.toArray();
  res.send(result);
});

app.get('/cart/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await Addjobs.findOne(query);
  res.send(result);
});
app.delete('/cart/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id)  }
  const result = await Addjobs.deleteOne(query)
  res.send(result)

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


