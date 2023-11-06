const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
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

let Addjobs;

async function run() {
  try {
    await client.connect();
    Addjobs = client.db("Jobmarket").collection('Addjobs');

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
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
  try {
    const query = {};

    if (req.query.Email) {
      query.Email = req.query.Email;
    }

    const result = await Addjobs.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/cart/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await Addjobs.findOne(query);
  res.send(result);
});

app.put('/cart/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updatedCart = req.body;
  const Cart = {
    $set: {
      Email: updatedCart.Email,
      Jobtitle: updatedCart.Jobtitle,
      Deadline: updatedCart.Deadline,
      Description: updatedCart.Description,
      Category: updatedCart.Category,
      Minimumprice: updatedCart.Minimumprice,
      Maximumprice: updatedCart.Maximumprice
    }
  };
  const result = await Addjobs.updateOne(filter, Cart);
  res.send(result);
});

app.delete('/cart/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await Addjobs.deleteOne(query);
  res.send(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});