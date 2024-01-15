const mongoose = require("mongoose");
const validator = require("validator");

const usersSchema = new mongoose.Schema({
    fname:{
        type : String,
        required : true,
        trim : true,
    },
    lname:{
        type : String,
        required : true,
        trim : true,
    },
    email:{
        type: String,
        required : true,
        unique : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw Error("Not Valid Email")
            }
        }
    },
    mobile:{
        type : String,
        required : true,
        minlength : 10,
        maxlength : 10,
        unique : true,
    },
    gender:{
        type : String,
        required : true,
    },
    status:{
        type : String,
        required : true,
    },
    profile:{
        type : String,
        required : true,
    },
    location:{
        type : String,
        required : true,
    },
    datecreated:Date,
    dateUpdated: Date
})

//Model

const users = new mongoose.model("users", usersSchema);

module.exports = users;