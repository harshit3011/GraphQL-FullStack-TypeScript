import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required : true
    }
})

export const Task = mongoose.model("Task",taskSchema)