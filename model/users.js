const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  name: {
    type: String,
    required: [true, 'User must have a name']
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email must be unique']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['admin', 'guide', 'lead-guide', 'user'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false //It works only with fetching data
  },
  confirmPassword: {
    type: String,
    required: [true, 'User must confirm password'],
    validate: {
      validator: function(el) {
        return this.password == el;
      },
      message: 'Passwords are not match'
    }
  },
  passwordChanged: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.pre('save', function(next) {
  if (!this.isModified || this.isNew) {
    return next();
  }
  this.passwordChanged = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function(
  userPassword,
  savedPassword
) {
  //arguments order important
  return await bcrypt.compare(userPassword, savedPassword);
};

userSchema.methods.isPasswordChanged = function(jwtIssuedTime) {
  if (this.passwordChanged) {
    const passwordChangedParse = parseInt(
      this.passwordChanged.getTime() / 1000,
      10
    );
    return jwtIssuedTime < passwordChangedParse;
  }
  return false;
};

userSchema.methods.generatePasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const encryptedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  await this.updateOne({
    passwordResetToken: encryptedToken,
    passwordResetTokenExpires: Date.now() + 10 * 60 * 1000
  });
  console.log({ resetToken });
  // this.passwordResetToken = encryptedToken;
  // this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // await this.save({ validateBeforeSave: false });

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
