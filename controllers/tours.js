const Tour = require('.././model/tours');
const fs = require('fs');
const ErrorHandler = require('../utilities/errorHandler');
const util = require('../utilities/features');
const catchAsync = require('../utilities/catchAsync');

// const toursFromFile = JSON.parse(fs.readFileSync(__dirname + '/../dev-data/data/tours-simple.json', 'utf-8'));
exports.getAllTours = catchAsync(async (req, res, next) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit;
  const skip = (page - 1) * limit;
  if (skip >= (await Tour.countDocuments())) {
    throw new Error('This page has no content');
  }
  const tours = await Tour.find()
    .skip(skip)
    .limit(limit);
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: tours
  });
});

exports.getTourStat = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        //responsiple for displaying data[other fields are for filtering]
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
        avgPrice: { $avg: '$price' }
      }
    },
    {
      $match: {
        maxPrice: { $gte: 1500 }
      }
    },
    {
      $sort: {
        numTours: 1, //asceding
        maxPrice: -1
      }
    }
    // {
    //   $match: {
    //     _id: { $ne: 'difficult' }
    //   }
    // }
  ]);
  res.status(200).json({
    status: 'Success',
    results: stats.length,
    data: stats
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //deconstruct each elemnt of the [startDates] to be one document for each elemnt
    },
    {
      $match: {
        startDates: {
          $gte: new Date(year + '-01-01'),
          $lte: new Date(year + '-12-31')
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { month: 1 }
    }
    // {
    //   $limit: 2 //only showing 2 documents
    // }
  ]);
  res.status(200).json({
    status: 'Success',
    results: plan.length,
    data: plan
  });
});

exports.sortTours = catchAsync(async (req, res) => {
  const tours = await Tour.find()
    .sort(util.sortTours(req.query.sort))
    .select(util.sortTours(req.query.fields));
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: tours
  });
});

exports.limitTours = catchAsync(async (req, res) => {
  const query = req.query.feilds.split(',').join(' ');
  const tours = await Tour.find().select(query);
  //select('-somthing') will exclude "somthing"
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new ErrorHandler('No tour with this ID', 404));
  }
  res.status(201).json({
    status: 'Success',
    data: tour
  });
});

exports.postTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: newTour
  });
});

exports.replaceTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if(!tour) {
    return next(new ErrorHandler('No tour with this ID', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: tour
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if(!tour) {
    next(new ErrorHandler('No tour with this ID', 404));
  }
  res.status(204).json({
    status: 'Success',
    data: null
  });
});

// exports.importData = async (req, res) => {
//     try {
//         await Tour.create(toursFromFile);
//         res.status(201).json({
//             status: 'Success',
//             data: toursFromFile
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(404).json({
//             status: 'Fail',
//             message: err
//         });
//     }
// };

// exports.deleteData = async (req, res) => {
//     try {
//         await Tour.deleteMany();
//         res.status(204).json({
//             status: 'Success',
//             data: null
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'Fail',
//             message: err
//         });
//     }
// };
