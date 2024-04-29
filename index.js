const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SK)
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bpilnp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const userCollection = client.db("meetDoc").collection("users");
        const doctorCollection = client.db("meetDoc").collection("doctors");
        const meetingCollection = client.db("meetDoc").collection("meetings");
        const paymentCollection = client.db("meetDoc").collection("payments");
        const feedbackCollection = client.db("meetDoc").collection("feedbacks");

        

        // user related api 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({message: 'user already exists', insertedId: null})
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send(user);
        })

        app.patch('/updateUser', async (req, res) => {
            const user = req.body;
            const email = user.email;

            const query = { email: email };
            const updatedDoc = {
                $set: {
                    url: user.url,
                    bio: user.bio
                }
            }

            const result = await userCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        // make admin api

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }

            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // doctor related api 
        app.post('/doctors', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            const existingDoctor = await doctorCollection.findOne(query);
            if (existingUser || existingDoctor) {
                return res.send({message: 'user already exists', insertedId: null})
            }

            const result = await doctorCollection.insertOne(user);
            res.send(result);
        })

        app.get('/doctors', async (req, res) => {
            const result = await doctorCollection.find().toArray();
            res.send(result);
        })

        app.get('/doctor/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const doctor = await doctorCollection.findOne(query);
            res.send(doctor);
        })

        // make doctors 
        app.patch('/users/doctor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'doctor'
                }
            }
            const result = await doctorCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })


        app.delete('/doctors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await doctorCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/users/doctor/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await doctorCollection.findOne(query);
            let doctor = false;
            if (user) {
                doctor = user?.role === 'doctor';
            }
            res.send({ doctor });
        })

        app.patch('/updateDoctor', async (req, res) => {
            const doctor = req.body;
            const email = doctor.email;
            
            const query = { email: email };
            const updatedDoc = {
                $set: {
                    institute: doctor.institute,
                    category: doctor.category,
                    qualification: doctor.qualification,
                    fee: doctor.fee,
                    url: doctor.url,
                    bio: doctor.bio
                }
            }

            const result = await doctorCollection.updateOne(query, updatedDoc);
            res.send(result);
            
        })

        app.get('/getDocMeeting/:email', async (req, res) => {
            const email = req.params.email;
            const query = { doc_email: email };
            const meetings = await meetingCollection.find(query).toArray();
            res.send(meetings);
        })
        

        // admin related api

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await userCollection.findOne(query);
            
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })

        // meeting related api
        app.get('/meetings', async (req, res) => {
            const result = await meetingCollection.find().toArray();
            res.send(result);
        })

        app.post('/setMeeting', async (req, res) => {
            const meeting = req.body;
            const result = await meetingCollection.insertOne(meeting);
            res.send(result);
        })

        app.get('/getMeeting/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const meetings = await meetingCollection.find(query).toArray();
            res.send(meetings);
        })

        app.get('/meetings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await meetingCollection.findOne(query);
            res.send(result);
        })

        app.delete('/meetings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await meetingCollection.deleteOne(query);
            res.send(result);
        })

        app.patch('/acceptRequest/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: 'accepted'
                }
            }

            const result = await meetingCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.patch('/acceptPayment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    payment: 'done'
                }
            }

            const result = await meetingCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.post('/stripePay', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
            res.send(result);
        })

        app.get('/payments/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const payments = await paymentCollection.find(query).toArray();
            res.send(payments);
        })

        // category related api 
        app.get('/doctors/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category };
            const doctors = await doctorCollection.find(query).toArray();
            res.send(doctors);
        })

        // payment intents 
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        })


        // feedback api 
        app.post('/feedback', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await feedbackCollection.insertOne(data);
            res.send(result);
        })

        app.get('/feedback', async (req, res) => {
            const result = await feedbackCollection.find().toArray();
            res.send(result);
        })

    

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})