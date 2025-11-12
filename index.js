const express = require('express')
const cors = require('cors');
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
    const usersCollection = db.collection('users');
    const enrollmentsCollection = db.collection('enrollments');

    // this only for user
    app.post('/users', async (req, res) => {
      const newUser = req.body

      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: 'user already exits . do not need insert again ' })
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }

      // POST: Enroll in a course
      app.post('/enrollments', async (req, res) => {
        const enrollment = req.body;
        const query = {
          courseId: enrollment.courseId,
          userEmail: enrollment.userEmail,
        };
        const existing = await enrollmentsCollection.findOne(query);
        if (existing) {
          return res.send({ message: "Already enrolled" });
        }
        const result = await enrollmentsCollection.insertOne(enrollment);
        res.send(result);
      });

      // GET: Get enrolled courses by user email
      app.get('/enrollments', async (req, res) => {
        const email = req.query.email;
        const query = { userEmail: email };
        const result = await enrollmentsCollection.find(query).toArray();
        res.send(result);
      });

    })

    app.get('/courses', async (req, res) => {
      const cursor = coursesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/popularCourses', async (req, res) => {
      const cursor = coursesCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coursesCollection.findOne(query);
      res.send(result);
    })


    app.post('/courses', async (req, res) => {
      const newCourses = req.body;
      const result = await coursesCollection.insertOne(newCourses);
      res.send(result);

    })


    app.patch('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const updateCourse = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateCourse.name,
          price: updateCourse.price
        }
      }
      const result = await coursesCollection.updateOne(query, update);
      res.send(result)
    })

    app.delete('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
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
