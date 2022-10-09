const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db_pg/db");
const userModel = require("../models/userModel.pg");

const messageModel = sequelize.define(
  "message",
  {
    message: {
      type: DataTypes.STRING,
      require: true,
    },
    users: {
      type: DataTypes.ARRAY(Sequelize.STRING),
    },
    sender: {///////////////////////////
      type: DataTypes.UUID,
      require: true,
      references: {
        model: userModel,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = messageModel;




