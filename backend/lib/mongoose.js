const mongoose = require('mongoose')

const connectToDatabase = async () => {
    try {
        if(mongoose.connection.readyState === 1){
            return console.log(`MongoDb has already connected!`);
        }

        mongoose.connect(process.env.MONGO_URI, { dbName: "DLS" })
        console.log("Db connected successfully!")
    } catch (error) {
        console.log(`Error on connect to database!`, error);
    }
}

module.exports = { connectToDatabase }