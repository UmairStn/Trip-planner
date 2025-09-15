require('dotenv').config();

const express = require('express');
const tripRoutes = require('./src/api/routes/trip.route.js'); // 1. Import your new router


const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', tripRoutes); // 2. Use the router for API routes

app.get('/api/test', (req, res) => {
  res.send('API is working');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})