const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {ErrorCustom} = require('../core/errorCustom');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
const AuthSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: 'User', required: true
    },
    username:{
        type: String,
        required: [true, "Please provide a username"],
        unique: [true,"Please provide a unique username"],
        trim: [true, "Name must not contain leading or trailing spaces"],
        min: 3,
        max: 10
    },
    password:{
        type: String,
        required: [true, "Please provide a password"],
        validate:{
            validator:(v) => passwordRegex.test(v),
            message:"Password must contain at least one number and one special character"
        },
        min: 6,
        max: 20
    },
    role: { type: String, enum: ["student", "parent", "teacher", "admin", "consultant", "academic"], required: true },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
});
AuthSchema.pre('save', async function(next){
    const user = this;

    if(!user.isModified('password')) return next();
    try{
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_WORK_FACTOR, 10));
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch(err){
        return next(err);
    }
})

AuthSchema.methods.comparePassword = async function(candidatePassword){
    return bcrypt.compare(candidatePassword, this.password);
}

AuthSchema.methods.generateToken = function(){
    try {
        return jwt.sign(
          {id: this._id, email: this.email, role: this.role}, 
          process.env.JWT_SECRET, 
          {expiresIn: process.env.JWT_EXPIRES_IN});
      } catch (error) {
        throw new ErrorCustom("Error during generate token", 500);
      }
}
module.exports = mongoose.model("Auth", AuthSchema);