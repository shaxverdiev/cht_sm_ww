const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const userModel = require("../models/userModel.pg");

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ where: { username } });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await userModel.findOne({
      where: { username: username },
    });

    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await userModel.findOne({ where: { email } });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email: email,
      username: username,
      password: hashedPassword,
    });
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const usersDB = await userModel.findAll({
      where: {
        id: {
          [Op.not]: [req.params.id],
        },
      },
    });

    return res.json(usersDB);
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
