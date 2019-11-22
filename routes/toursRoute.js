const express = require('express');

const tourController = require('../controllers/tours');
const authController = require('../controllers/auth');

const toursRoute = express.Router();

// toursRoute
//   .route('/import')
//   .post(tourController.importData);

// toursRoute
//   .route('/delete')
//   .delete(tourController.deleteData);

toursRoute.route('/sort').get(tourController.sortTours);

toursRoute.route('/limit').get(tourController.limitTours);

toursRoute.route('/stat').get(tourController.getTourStat);

toursRoute.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

toursRoute
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.replaceTour)
  .delete(
    authController.protect,
    authController.strictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

toursRoute
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.postTour);

module.exports = toursRoute;
