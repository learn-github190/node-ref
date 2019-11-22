module.exports = (err, req, res, next) => {
  //you MUST write next argument
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
