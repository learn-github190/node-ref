const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(__dirname + '/../dev-data/data/tours-simple.json')
);

exports.checkId = (req, res, next) => {
  const tour = tours.find(el => req.params.id == el.id);
  if (!tour)
    return res.status(404).json({
      status: 'Fail',
      message: 'id is not exist'
    });
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'sccess',
    results: tours.length,
    data: {
      tours: tours
    }
  });
};

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: tours.find(el => el.id === +req.params.id)
    }
  });
};

exports.nameAndPriceValidation = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'Fail',
      message: 'Either Name Or Price Not Defined'
    });
  next();
};

exports.postTour = (req, res) => {
  const newTour = { ...req.body, id: new Date() };
  tours.push(newTour);
  fs.writeFile(
    __dirname + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.replaceTour = (req, res) => {
  const oldTour = tours.find(el => req.params.id == el.id);
  const index = tours.indexOf(oldTour);
  tours[index] = { ...req.body };
  fs.writeFile(
    __dirname + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    () => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: req.body
        }
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const deletedTour = tours.find(el => el.id === +req.params.id);
  const index = tours.indexOf(deletedTour);
  tours.splice(index, 1);
  fs.writeFile(
    __dirname + '/dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    () => {
      res.status(200).json({
        status: 'success',
        data: null
      });
    }
  );
};
    