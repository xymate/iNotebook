const mongoose=require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config.env') });

const mongoURI=process.env.MONGO_URL;

const connectToMongo=()=>{
    mongoose.connect(mongoURI);
}

module.exports=connectToMongo;