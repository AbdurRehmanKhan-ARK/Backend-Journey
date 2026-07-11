import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    }
},{timestamps:true})

export const Category = mongoose.model("Category", categorySchema)

// ! Remember in database schema name is converted to lowercase and plural [ here: categories ]

