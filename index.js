const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}));
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
let mybids;

async function run() {
  try {
    await client.connect();

    Addjobs = client.db("Jobmarket").collection('Addjobs');
    mybids = client.db("Jobmarket").collection('mybids');

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);


// auth api
// app.post('/jwt', async (req, res) => {
//   const user = req.body
//   console.log("user token", user);
//   const token = jwt.sign(user, d006b6ee310287fa1d1430612621bdbf162a0ebcdbda64dd2459559d1c599c375bb645569f2f308ee5fca89573a761087fa76a26a58b9be9d4de5623fd9961a8, { expiresIn: '17' })
//   res.cookie('token',token,{
//     httpOnly: true,
//     secure:true
//   })
    
//     send({ success: true })
// })


// app.post('/logout', async (req, res) => {
//   const user = req.body
//   console.log('loging out',user);
//   res.clearCookie('token',{maxAge:0}.send({success:true}))
//   })



//service  
app.get('/', (req, res) => {
  res.send('Hello World!');
});
// post
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


// my bits 
app.post('/mybids', async (req, res) => {
  const carts = req.body;
  const result = await mybids.insertOne(carts);
  res.send(result);
});

app.get('/mybids', async (req, res) => {
  try {
    let query = {};
    let sort = {}
    
    const sortField = req.query.sortField
    const sortOrder = req.query.sortOrder



    if (req.query.Email) {
      query.Email = req.query.Email;
    }
    if (sortField && sortOrder){
      sort[sortField] = sortOrder
    }
    const cursor = mybids.find(query).sort(sort);
    const result = await cursor.toArray()
    res.send(result);
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/mybids/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await mybids.findOne(query);
  res.send(result);
});


// byer bids request
app.post('/BidRequest', async (req, res) => {
  const carts = req.body;
  const result = await mybids.insertOne(carts);
  res.send(result);
});

app.get('/BidRequest', async (req, res) => {
  try {
    const query = {};
    if (req.query.Byeremail) {
      query.Byeremail = req.query.Byeremail;
    }
    const result = await mybids.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// byer delete and ackcept 

app.patch('/BidRequest/:id', async (request, response) => {
  const id = request.params.id
  const query = { _id: new ObjectId(id) }

  const updateStatue = {
    $set: {
      status: request.body.status,
    },
  };
  const result = await mybids.updateOne(query, updateStatue);
  response.send(result);
});
app.patch('/mybids/:id', async (request, response) => {
  const id = request.params.id
  const query = { _id: new ObjectId(id) }

  const updateStatue = {
    $set: {
      status: request.body.status,
    },
  };
  const result = await mybids.updateOne(query, updateStatue);
  response.send(result);
});
app.patch('/BidRequest/:id', async (request, response) => {
  const id = request.params.id
  const query = { _id: new ObjectId(id) }

  const updateStatue = {
    $set: {
      status: request.body.status,
    },
  };
  const result = await mybids.updateOne(query, updateStatue);
  response.send(result);
});


// sort by viwe in 



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
