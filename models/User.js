const mongoose = require('mongoose'); 
const { isEmail } = require('validator'); // We use this package to validate things 
// and here we are checking whether this email is valid or not

const bcrypt = require('bcrypt'); 

const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: [true, 'Please enter an email'], 
        unique: true, 
        lowercase: true, 
        validate: [isEmail, 'Please enter a valid email']
    }, 
    password: {
        type: String, 
        required: [true, 'Please enter an password'], 
        minlength: [6, 'Minimum password length is 6 characters']
    }
}); 

// Fire a function before/after document is saved to DB 
// monngose Hooks: {
    // Pre: Hooks
    // Post: Hooks
//}

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(); 
    this.password = await bcrypt.hash(this.password, salt); 
    next(); 
});


// After Saving that data
userSchema.post('save', function (document, next) {
    console.log('A new user was created and saved', document); 
    next(); 
}); 

// static method to login user 

userSchema.statics.login = async function (email, password) {
    const user = await this.findOne({ email }); 
    if (user) {
        const auth = await bcrypt.compare(password, user.password); 
        if (auth) {
            return user; 
        } else {
            throw Error('Incorrect Password'); 
        }
    } else {
        throw Error('Incorrect Email'); 
    }
}

const User = mongoose.model('user', userSchema);

module.exports = User; 