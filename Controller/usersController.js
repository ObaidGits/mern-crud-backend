const users = require("../models/userSchema");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
const BASE_URL = process.env.BASE_URL;

//Register
exports.userpost = async(req,res)=>{
    const file = req.file.filename;
    const {fname, lname, email, mobile, gender, location, status} = req.body;

    if(!fname || !lname || !email || !gender || !location || !status || !file){
        res.status(401).json("All Inputs are Required");
    }
    try{
        const peruser = await users.findOne({email:email});
        if(peruser){
            res.status(401).json("This user already Exist in Our database");
        }
        else{
            const datecreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
            const userData = new users({
                fname, lname, email, mobile, gender, location, status, profile:file, datecreated
            });
            await userData.save();
            res.status(200).json(userData);
        }
    }
    catch(error){
        res.status(401).json(error);
        console.log("Catch Block Error");
    }
}

//Get
exports.userget = async(req,res)=>{

    const search = req.query.search || "";
    const gender = req.query.gender || "";
    const status = req.query.status || "";
    const sort = req.query.sort || "";
    const page = req.query.page || 1 ;
    const item_per_page = 4;

    const query={
        fname : {$regex: search, $options:"i"}
    }
    if(gender !== "All"){
        query.gender = gender;
    }
    if(status !== "All"){
        query.status = status;
    }
    
    try{
        // console.log(req.query);
        const skip = (page-1) * item_per_page;
        const count = await users.countDocuments(query);
        
        const usersdata = await users.find(query).sort({datecreated:sort == "new"? -1 : 1}).limit(item_per_page).skip(skip);
        const pageCount = Math.ceil(count/item_per_page);

        res.status(200).json({
            Pagination:{
            count, pageCount
        },usersdata});
    }
    catch(err){
        res.status(401).json(err);
    }
}

//Get Single User
exports.singleuserget = async(req,res)=>{
    
    const {id} = req.params;

    try{
        const usersdata = await users.findOne({_id:id});
        res.status(200).json(usersdata);
    }
    catch(err){
        res.status(401).json(err);
    }
}

//User Edit
exports.useredit = async(req,res)=>{
    const {id} = req.params;
    const {fname, lname, email, mobile, gender, location, status, user_profile} = req.body;
    const file = req.file? req.file.filename : user_profile;
    const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    try{
        const updateuser = await users.findByIdAndUpdate({_id:id},{
            fname, lname, email, mobile, gender, location, status, profile:file, dateUpdated
        },{
            new: true
        });

        await updateuser.save();
        res.status(200).json(updateuser);
    }
    catch(error){
        res.status(401).json(error);
    }
}

//User Delete
exports.userdelete = async(req,res)=>{
    const {id} = req.params;
    try{
        const deleteUser = await users.findByIdAndDelete({_id:id});
        res.status(200).json(deleteUser);
    }
    catch(error){
        res.status(401).json(error);
    }
}

//Update Status
exports.userstatus = async(req, res)=>{
    const {id} = req.params;
    const {data} = req.body;
    try{
        const updatestatus = await users.findByIdAndUpdate({_id:id},{status: data},{new: true});
        res.status(200).json(updatestatus);
    }
    catch(error){
        res.status(401).json(error);
    }
}

//Export User
exports.userExport = async(req,res)=>{
    try{
        const usersdata = await users.find();
        const csvStream = csv.format({headers: true});

        if(!fs.existsSync("public/files/export")){
            if(!fs.existsSync("public/files")){
                fs.mkdirSync("public/files/");
            }
            if(!fs.existsSync("public/files/export")){
                // fs.mkdir("public/files/export");
                fs.mkdirSync("./public/files/export/");
            }
        }

        const writeableStream = fs.createWriteStream("public/files/export/users.csv");
        csvStream.pipe(writeableStream);
        writeableStream.on("finish", function(){
            res.json({
                downloadUrl: `${BASE_URL}/files/export/users.csv`
            })
        })

        if(usersdata.length>0){
            usersdata.map((user)=>{
                csvStream.write({
                    FirstName: user.fname? user.fname : "-",
                    LastName: user.lname? user.lname : "-",
                    Email: user.email? user.email : "-",
                    Mobile: user.mobile? user.mobile : "-",
                    Gender: user.gender? user.gender : "-",
                    Location: user.location? user.location : "-",
                    Status: user.status? user.status : "-",
                    Profile: user.profile? user.profile : "-",
                    DateCreated: user.datecreated? user.datecreated : "-",
                    DateUpdated: user.dateUpdated? user.dateUpdated : "-",
                })
            })
        }

        csvStream.end();
        writeableStream.end();
    }
    catch(error){
        res.status(401).json(error);
    }
}