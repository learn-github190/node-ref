// const fs = require('fs');

// let users = JSON.parse(
//   fs.readFileSync(__dirname + '/../dev-data/data/users.json')
// );

// exports.checkIdValildity = (req, res, next, value) => {
//   const user = users.find(el => req.params.id == el.id);
//   if (!user) {
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'id is not exist'
//     });
//   }
//   next();
// };

exports.getAllUsers = (req, res) => {
  // res.status(200).json({
  //   status: 'Success',
  //   results: users.length,
  //   data: {
  //     users: users
  //   }
  // });
};

exports.getUser = (req, res) => {
  // res.status(200).json({
  //   status: 'Success',
  //   data: {
  //     user: user
  //   }
  // });
};

exports.postUser = (req, res) => {
  // users.push(req.body);
  // fs.writeFile(
  //   __dirname + '/dev-data/data/users.json',
  //   JSON.stringify(users),
  //   err => {
  //     res.status(200).json({
  //       status: 'Success',
  //       data: req.body
  //     });
  //   }
  // );
};

exports.replaceUser = (req, res) => {
  // users.splice(
  //   users.indexOf(users.find(el => el._id == req.params.id)),
  //   1,
  //   req.body
  // );
  // fs.writeFile(
  //   __dirname + 'dev-data/data/users.json',
  //   JSON.stringify(users),
  //   err => {
  //     res.status(200).json({
  //       status: 'Success',
  //       data: {
  //         user: req.body
  //       }
  //     });
  //   }
  // );
};

exports.deleteUser = (req, res) => {
  // const newUsersArr = [...users.filter(el => req.params.id !== el._id)];
  // users = newUsersArr;
  // fs.writeFile(
  //   __dirname + '/dev-data/data/users.json',
  //   JSON.stringify(users),
  //   err => {
  //     res.status(201).json({
  //       status: 'Success',
  //       data: null
  //     });
  //   }
  // );
};
