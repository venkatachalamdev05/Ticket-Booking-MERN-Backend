const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());
var cors = require('cors')
app.use(cors())
const Razorpay = require('razorpay');
app.listen("5000", () => {
    console.log("Application is running on Port 5000");
})

mongoose.connect("mongodb+srv://venkatachalam:fPXtBVXN0NgD1kBE@cluster0.lpvtq.mongodb.net/ticketBooking?retryWrites=true&w=majority&appName=Cluster0")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const descriptionSchema = new mongoose.Schema({
    plot: String,
    highlights: Array,
    trivia: Array
})

const movieSchema = new mongoose.Schema({
    id: String,
    title: String,
    language: String,
    genre: Array,
    duration: String,
    release_date: String,
    rating: String,
    synopsis: String,
    cast: Array,
    director: String,
    poster_image: String,
    description: descriptionSchema,
})

const theatrerDetailSchema = new mongoose.Schema({
    name: String,
    timings: [String]
})

const theaterSchema = new mongoose.Schema({
    location: String,
    theaters: [theatrerDetailSchema]
})



const theaterModel = new mongoose.model("theatercollections", theaterSchema)

const userModel = new mongoose.model("users", userSchema)

const movieModel = new mongoose.model("movieslistcollections", movieSchema)

app.post('/signup-user', async (req, res) => {
    try {
        const userData = new userModel({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10)
        });
        await userData.save(); // Save the user to the database
        res.status(201).json({ message: "User successfully created" });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Username or email already exists" });
        } else {
            res.status(500).json({ message: "An error occurred" });
        }
    }
});

app.post('/signin-user', async (req, res) => {


    try {
        const userData = await userModel.findOne({ name: req.body.name });
        if (await bcrypt.compare(req.body.password, userData.password)) {
            console.log(req.body);
            res.status(201).json({ message: "Login successfull" });
        } else {
            res.status(400).json({ message: "Invalid password" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred during login" });
    }
});

app.get('/home-movie-list', async (req, res) => {
    try {
        const randomMovies = await movieModel.aggregate([{ $sample: { size: 3 } }]);
        res.status(200).json(randomMovies);
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "An error occurred while fetching the movie list" });
    }
});

app.get('/movie-list', async (req, res) => {
    try {
        const randomMovies = await movieModel.find({});
        res.status(200).json(randomMovies);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while fetching the movie list" });
    }
});


app.get('/movie-list/:name', async (req, res) => {
    try {
        const randomMovies = await movieModel.find({ title: req.params.name });
        res.status(200).json(randomMovies);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "An error occurred while fetching the movie list" });
    }
});



app.get('/theatersList', async (req, res) => {
    try {
        const randomMovies = await theaterModel.find({});
        res.status(200).json(randomMovies);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching the theaters list" });
    }
});


const razorpay = new Razorpay({
    key_id: "rzp_test_1H1NdrDCdx5Dmf",
    key_secret: "4p0UqbVw581aYV4ueGMSqigs",
});


app.post('/api/create-order', async (req, res) => {
    console.log(req.body.amount);

    const options = {
        amount: req.body.amount, // amount in the smallest currency unit (paise)
        currency: 'INR',
        receipt: 'receipt_order_74394',
    };
    console.log(options);

    try {
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).send('Error creating order');
    }
});