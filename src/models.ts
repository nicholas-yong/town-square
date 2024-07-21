import { model, Schema } from "mongoose";

const postSchema = new Schema({
    _id: Schema.ObjectId,
    title: { type: String },
    content: { type: String },
    order: { type: Number }
})


export default model('Post', postSchema);
