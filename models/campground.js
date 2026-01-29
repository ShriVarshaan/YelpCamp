const mongoose = require("mongoose")
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
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema)