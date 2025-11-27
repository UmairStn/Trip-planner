require('dotenv').config();
const ejsMate = require('ejs-mate');
const path = require('path');

const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const tripRoutes = require('./src/api/routes/trip.route.js'); // 1. Import your new router


const app = express();
const PORT = process.env.PORT || 5000;

// async function connectToDatabase() {
//     try {
//         await mongoose.connect('mongodb://127.0.0.1:27017/tripPlannerDb');
//         console.log("MONGO CONNECTION OPEN!!");
//     } catch (error) {
//         console.error("MONGO CONNECTION ERROR!!");
//         console.error(error);
//     }
// }
// connectToDatabase();

app.engine('ejs', ejsMate)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionConfig = {
    secret: "magicWord",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));

app.use(express.static(path.join(__dirname, 'src/public')));

app.use('/', tripRoutes); // 2. Use the router for API routes

app.get('/test', (req, res) => {
    res.send('API is working');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})