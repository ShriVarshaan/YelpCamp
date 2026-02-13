const mongoose = require("mongoose")
const Joi = require("joi")

const reviewSchema = new mongoose.Schema({
    body: {
        type: String
    },
    rating: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})

const reviewSchemaJoi = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    })
})

const Review = mongoose.model("Review", reviewSchema)
module.exports = {Review, reviewSchemaJoi}