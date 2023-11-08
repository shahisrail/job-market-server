const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken')
const cookieParse = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParse())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bkdyuro.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middelseware
const logger = (req, res, next) => {
  console.log(('log : info'), req.method, req.url);
  next();
}
// middelewares
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token
  console.log("token in the middle ware", token);
  if (!token) {
    return res.status(401).send({ massage: "unathoeized  " })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ massage: 'unathoeized accsess' })
    }
    req.user = decoded;
    next()
  })
}

let Addjobs;
let mybids;

async function run() {
  try {
    await client.connect();

    Addjobs = client.db("Jobmarket").collection('Addjobs');
    mybids = client.db("Jobmarket").collection('mybids');

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


    // auth api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      console.log("user token", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '17hr' })
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: false
      })
        .send({ success: true })
    })

    app.post('/logout', async (req, res) => {
      const user = req.body
      console.log('login out', user);
      res.clearCookie('token', { maxAge: 0, httpOnly: true, secure: false }).send({ succses: true })
    })



    //service  

    // post
    app.post('/cart', async (req, res) => {
      const carts = req.body;
      const result = await Addjobs.insertOne(carts);
      res.send(result);
    });

    app.get('/carts', async (req, res) => {
      const cursor = Addjobs.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Addjobs.findOne(query);
      res.send(result);
    });

    app.get('/cart', logger, async (req, res) => {
      try {
        // console.log( 'token owner info ', req.user);
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

    app.get('/mybids',verifyToken, async (req, res) => {
      try {
        let query = {};
        let sort = {}
        if (req.user.email !== req.query.Email) {
          return res.send.status(403).send({ massage: "forbidden accsess" })
        }

        const sortField = req.query.sortField
        const sortOrder = req.query.sortOrder
        console.log('token woner info', req.user);
       
        if (req.user.email !== req.query.Email) {
          return res.send.status(403).send({ massage: "forbidden accsess" })
        }

        if (req.query.Email) {
          query.Email = req.query.Email;
        }
        if (sortField && sortOrder) {
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

    app.get('/BidRequest', verifyToken, async (req, res) => {
      try {
        const query = {};
        if (req.user.email !== req.query.Byeremail) {
          return res.send.status(403).send({ massage: "forbidden accsess" })
        }
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

  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
