import mongoose from "mongoose";

const MessageModelSchema = new mongoose.Schema({
    message:{
        type:String,
        trim:true,
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    },

    chat:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Chats"
    },

    },
    {timestamps:true}
    );

const MessagesModel = mongoose.model('MessagesModel', MessageModelSchema);

export default MessagesModel;


