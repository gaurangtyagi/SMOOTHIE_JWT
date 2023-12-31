require("dotenv").config();

const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 
// Error Handler
const errorHandler = (error) => {
    console.log(error.message, error.code); 
    let errors = {email: '', password: ''}; 

    // Incorrect Email
    if (error.message === 'Incorrect Email'){
        errors.email = 'This email is not registered'; 
    }

    // Incorrect Passwords
    if (error.message === 'Incorrect Password'){
        errors.password = 'The password is Incorrect'; 
    }

    // Duplicate Email Error
    if (error.code === 11000) {
        errors.email = 'This Email is already registered'; 
        return errors;
    }

    // Custom Validation Error
    if (error.message.includes('user validation failed')) {
        (Object.values(error.errors)).forEach (({properties}) => {
            errors[properties.path] = properties.message; 
            // properties.path can either be email or password
            // they shall store the error they are giving
        }); 
    } 
    return errors; 
}

const maxAge = 3 * 24 * 60 * 60; // 3 days

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET, {
        expiresIn: maxAge
    }); 
}

module.exports.signup_get = (req, res) =>{
    res.render('signup'); 
}

module.exports.signup_post = async (req, res) =>{
    const { email, password } = req.body; 
    
    try {
        const user = await User.create({ email, password }); 
        const token = createToken(user._id); 
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}); 
        res.status(201).json({ user: user._id});
    } catch (error) {
        const errors = errorHandler(error); 
        res.status(400).json({ errors }); 
    }
}

module.exports.login_get = (req, res) =>{
    res.render('login'); 
}

module.exports.login_post = async (req, res) =>{
    const { email, password } = req.body; 

    try {
        const user = await User.login(email, password); 
        const token = createToken(user._id); 
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000}); 
        res.status(200).json({ user: user._id}); 
    } catch (err) {
        const errors = errorHandler(err); 
        res.status(400).json({ errors });
    }
    res.render('new login'); 
}


module.exports.logout_get = async (req, res) => {
    res.clearCookie("jwt");
    res.redirect('/'); 
}