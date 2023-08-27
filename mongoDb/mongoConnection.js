import mongoose from 'mongoose'

const connectDatabase = async()=>{
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL,
            {
            useUnifiedTopology:true,
            useNewUrlParser:true,
            },
            (err) => {
             if(err) console.log(err) 
             else console.log("mongdb is connected");
            }
            )
        
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1);
    }
};
export default connectDatabase;