const { DataTypes, Sequelize } = require("sequelize");
const { sequelize } = require("../db_pg/db");

const userModel = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.literal("uuid_generate_v4()"),
      primaryKey: true,
      validate: {
        notNull: true,
        isUUID: 4,
      },
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      require: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      require: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      require: true,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = userModel;
