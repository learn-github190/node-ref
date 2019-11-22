const express = require('express');

const authControllers = require('../controllers/auth');

const userRoute = express.Router();

userRoute.route('/getUsers').get(authControllers.getUsers);

userRoute.route('/resetPassword/:token').patch(authControllers.resetPassword);

userRoute.route('/forgotPassword').post(authControllers.forgotPassword);

userRoute
  .route('/updateMe')
  .patch(
    authControllers.protect,
    authControllers.uploadUserImage,
    authControllers.resizeImage,
    authControllers.updateMe
  );

userRoute
  .route('/deleteMe')
  .delete(authControllers.protect, authControllers.deleteMe);

userRoute
  .route('/updatePassword')
  .patch(authControllers.protect, authControllers.updatePassword);

userRoute.route('/signup').post(authControllers.signup);

userRoute.route('/login').post(authControllers.login);

module.exports = userRoute;
