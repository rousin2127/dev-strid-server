const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
// const uri = "mongodb+srv://devStridUser:rHtfAverbFyZe4st@cluster0.ijc2zmy.mongodb.net/?appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijc2zmy.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('DevStride server is Running');
});

async function run() {
  try {
    await client.connect();

    const db = client.db('devStride');
    const coursesCollection = db.collection('courses');
    const usersCollection = db.collection('users');
    const enrollmentsCollection = db.collection('enrollments');

    // ✅ USERS
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      const query = { email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists, no need to insert again.' });
      }
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // ✅ COURSES
    // Get all or filter by instructor email
    app.get('/courses', async (req, res) => {
      const email = req.query.email;
      const query = email ? { instructorEmail: email } : {};
      const result = await coursesCollection.find(query).toArray();
      res.send(result);
    });

    // Popular courses (top 6 by rating)
    app.get('/popularCourses', async (req, res) => {
      const result = await coursesCollection.find().sort({ rating: -1 }).limit(6).toArray();
      res.send(result);
    });

    // Get single course by ID
    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const result = await coursesCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Add new course
    app.post('/courses', async (req, res) => {
      const newCourse = req.body;
      const result = await coursesCollection.insertOne(newCourse);
      res.send(result);
    });

    // Update course
    app.patch('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const updateCourse = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updateCourse
      };
      const result = await coursesCollection.updateOne(query, update);
      res.send(result);
    });

    // Delete course
    app.delete('/courses/:id', async (req, res) => {
      const id = req.params.id;
      const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    
    // Enroll in a course
    app.post('/enrollments', async (req, res) => {
      const enrollment = req.body;
      const query = { courseId: enrollment.courseId, userEmail: enrollment.userEmail };
      const existing = await enrollmentsCollection.findOne(query);
      if (existing) {
        return res.send({ message: 'Already enrolled' });
      }
      const result = await enrollmentsCollection.insertOne(enrollment);
      res.send(result);
    });

    // Get enrolled courses by user
    app.get('/enrollments', async (req, res) => {
      const email = req.query.email;
      if (!email) return res.send([]);
      const result = await enrollmentsCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
  } finally {
    // keep connection open
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`DevStride server is running on port ${port}`);
});
