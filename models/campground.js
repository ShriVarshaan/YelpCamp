const mongoose = require("mongoose")
const Joi = require("joi")
const {Review} = require("./review")
const Schema = mongoose.Schema

const CampgroundSchema = new Schema({
    title: {
        type: String
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi ipsa nostrum, explicabo, repellat harum totam distinctio velit id necessitatibus dolorum obcaecati praesentium ratione ad doloribus vitae, fugiat voluptas excepturi recusandae."
    },
    location: {
        type: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc && doc.reviews) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const campgroundSchemaJoi = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().allow(""),
        location: Joi.string().required(),
        description: Joi.string().allow(""),
        price: Joi.number().required().min(0)
    }).required()
})

const Campground = mongoose.model("Campground", CampgroundSchema)
module.exports = {Campground, campgroundSchemaJoi}