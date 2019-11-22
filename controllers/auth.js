const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../model/users');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/errorHandler');
const sendEmail = require('../utilities/email');
const { promisify } = require('util');

// const imageStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       'user-' +
//         req.user.id +
//         '-' +
//         Date.now() +
//         '.' +
//         file.mimetype.split('/')[1]
//     );
//   }
// });

const imageStorage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Only images is allowed to be uploaded', 400), false);
  }
};

const upload = multer({
  storage: imageStorage,
  fileFilter: imageFilter
});

const signToken = id => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '30d'
  });
};

exports.uploadUserImage = upload.single('photo');

exports.resizeImage = (req, res, next) => {
  if (req.file) {
    req.file.filename = 'user-' + req.user.id + '-' + Date.now() + '.jpeg';
    sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile('public/img/users/' + req.file.filename);
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  const decoded = await promisify(jwt.verify)(token, 'secret');

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('This account is no longer exist', 401));
  }

  if (currentUser.isPasswordChanged(decoded.iat)) {
    next(
      new AppError("User's password has been changed, please login again", 401)
    );
  }
  req.user = currentUser;
  next();
});

exports.strictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have authorization to access this page', 403)
      );
    }
    next();
  };
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    email: req.body.email,
    passwordChanged: req.body.passwordChanged,
    role: req.body.role
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'Success',
    token,
    data: newUser
  });
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError('Email and password are required!', 400));

  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  ); //we use select to include password with the result because we exlude it in the user model

  if (!user || !(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('Either email or password are wrong!', 401));

  const token = signToken(user._id);

  res.status(200).json({
    status: 'Success',
    token
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('This email is not exist', 404));
  }
  const token = await user.generatePasswordResetToken();
  const resetURL =
    req.protocol + '://' + req.get('host') + '/users/resetPassword/' + token;
  const message = 'To reset your password visit this page ' + resetURL;
  try {
    sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message: message
    });

    res.status(200).json({
      status: 'Success',
      message: 'Mail was send'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppError(
        'Something went wrong while sending email, try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpires: { $gte: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: 'Success',
    token
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError('The password is wrong', 401));
  }
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();
  const token = signToken(user._id);

  res.status(200).json({
    status: 'Success',
    token
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const obj = {
    name: req.body.name || req.user.name,
    email: req.body.email || req.user.email
  };
  if (req.file.filename) {
    obj.photo = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, obj, {
    new: true,
    runValidators: true
  });
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    data: obj
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null
  });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.json({
    users
  });
});
