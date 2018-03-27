import Sequelize from "sequelize";
import DatabaseConfig from "./constant";

function helperSequelizeIntialize(config) {
  return new Sequelize(config.dbName, config.dbUser, config.dbPass, {
    host: config.dbHost,
    dialect: "postgres"
  });
}

module.exports = helperSequelizeIntialize;
