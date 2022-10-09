require("dotenv").config();
const { Sequelize } = require("sequelize");

// создается новое подключение к базе данных
const sequelize = new Sequelize({
  dialect: "postgres",
  logging: process.env.DB_LOG ? console.log : false,
  host: process.env.DB_HOSTNAME,
  username: process.env.DB_USERNAME,
  password: `${process.env.DB_PASSWORD}`,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  sync: true,
  timezone: "+00:00",
  define: {
    timestamps: false,
  },
});

//проверка подключения
async function openConnection() {
  try {
    await sequelize.authenticate();
    console.log("Соединение с БД было успешно установлено");
  } catch (e) {
    console.log("Невозможно выполнить подключение к БД: ", e);
  }
}

(async () => {
  // Пересоздаем таблицу в БД
  await sequelize.sync();
  // дальнейший код
})();

module.exports.openConnection = openConnection();
module.exports.sequelize = sequelize;

require("../models/userModel.pg");
require("../models/messageModel.pg");
