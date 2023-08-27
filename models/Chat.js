import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    chatName:{
        type:String,
        trim:true
    },

    users:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Users"
    }],

    groupAdmin:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }],
    
    
    isRead:{
        type:Boolean,
        default:false

    },
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"MessagesModel"
    },
    isGroupChat:{
        type:Boolean,
        default:false

    },

    },
    {timestamps:true}
    );

const Chat = mongoose.model('Chats', ChatSchema);

export default Chat;


