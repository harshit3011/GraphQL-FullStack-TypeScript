import mongoose, { mongo } from "mongoose";

const projectSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export const Project = mongoose.model("Project", projectSchema)