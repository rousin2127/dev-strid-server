const express = require('express')
const cors= require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000


//midleware
app.use(cors());
app.use(express.json())

//user and pass 

//rHtfAverbFyZe4st

const uri = "mongodb+srv://devStridUser:rHtfAverbFyZe4st@cluster0.ijc2zmy.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/', (req, res) => {
  res.send('DevStride server is Running')
})


async function run() {
  try {
    await client.connect();

    const db = client.db('devStride');
    const coursesCollection = db.collection('courses');

    app.get('/courses', async(req, res)=>{
      const cursor = coursesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/courses/id:', async(req, res)=>{
      const id =req.params.id;
      const query = { _id: new ObjectId(id)};
      const result =await coursesCollection.findOne(query);
      res.send(result);
    })


    app.post('/courses', async(req,res) =>{
      const newCourses=req.body;
      const result= await coursesCollection.insertOne(newCourses);
      res.send(result);

    })


    app.patch('/courses/:id', async(req, res) =>{
      const id = req.params.id;
      const updateCourse= req.body;
      const query= { _id: new ObjectId(id)};
      const update={
        $set: {
          name: updateCourse.name,
          price: updateCourse.price
        }
      }
      const result = await coursesCollection.updateOne(query, update);
      res.send(result)
    })

    app.delete('/courses/:id', async(req, res) =>{
      const id= req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await coursesCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`DevStride server is Running on port ${port}`)
})
