import { model, Schema } from "mongoose";

const countersSchema = new Schema({
    seq: { type: Number }
})

const postSchema = new Schema({
    title: { type: String },
    content: { type: String },
    order: { type: Number }
})


export const PostModel = model('Post', postSchema);
export const CountersModel = model('Counters', countersSchema);
