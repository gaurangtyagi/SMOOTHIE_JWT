require("dotenv").config();

const express = require('express'); 
const mongoose = require('mongoose'); 
const cookieParser = require('cookie-parser'); 
const authRoutes = require('./routes/authRoute'); 
const { requireAuth, checkUser } = require('./middleware/authMiddleware'); 
const port = process.env.PORT || 5000; 
const app = express(); 

// middlewares
app.use(express.static('public')); 
app.use(express.json()); // this takes the data and attachs it to the req handler, so we can then access it req.body.something
app.use(cookieParser()); 
// view engine
app.set('view engine', 'ejs'); 

// DB Connection
mongoose.set(`strictQuery`, false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI); 
        console.log(`DataBase Connected: ${conn.connection.host}`); 
    } catch (error) {
        console.log(error);
    }
}
connectDB(); 

app.get("/", checkUser); 
app.get("/", (req, res) =>{
    res.render('home'); 
});


// Securing the route by using the middleware
app.get("/smoothies", requireAuth,(req, res) =>{
    res.render('smoothies'); 
}); 
// Routes
app.use("/", authRoutes);


app.listen(port, () => {
    console.log(`App listening on port ${port}...`);
});