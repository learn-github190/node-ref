const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        return this.price > val;
      },
      message: 'Discount price must be less than original price'
    }
  },
  ratingAverage: {
    type: Number,
    default: 4.5
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maximum size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty']
  },
  summary: {
    required: [true, 'A tour must have a summary'],
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

toursSchema.virtual('durationWeeks').get(function () { //will not be saved in the database but it will be outputed as a field in the document
  return this.duration / 7;
});

toursSchema.virtual('halfMaxGroupSize').get(function () {
  return this.maxGroupSize / 2;
});

const Tour= mongoose.model('Tour', toursSchema);

module.exports = Tour;
