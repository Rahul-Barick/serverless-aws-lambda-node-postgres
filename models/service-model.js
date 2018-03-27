import Sequelize from 'sequelize';


class ServicesModel {

  /**
   * Constructor for services class. Creates a sequelize object on initialisation
   * @param  {object} config object
   * @return {object} sequelize db instance
   */
  constructor(config) {
    this.db = this.createDb(config);
    return this;
  }

  /**
   * Function to create the DB connection
   * @param  {object} config variables including db params
   * @return {object} sequelize db object
   */
  createDb(config) {
    return new Sequelize(config.dbName, config.dbUser, config.dbPass, {
      host: config.dbHost,
      dialect: 'postgres',
    });
  }

  /**
   * Returns instance of the db object
   * @return {object} sequelize db instance
   */
  getDb() {
    return this.db;
  }

  /**
   * Closes the db connection. This stops lambda from hanging after running
   */
  closeDb() {
    this.db.close();
  }

  /**
   * Creates a 'successful' node callback
   * @param  {int} code HTTP status code
   * @param  {object} data - to return in the response object
   * @param  {Function} callback
   * @return {Function} callback
   */
  createSuccessCallback(code, data, callback) {
    this.closeDb();
    const paramCode = (code == null) ? 200 : code;
    const status = (paramCode < 400) ? paramCode : 200;
    const response = {
      statusCode: status,
      body: JSON.stringify({ status: 'success', data }),
    };
    if ((data == null) || (data == '')) { response.body = ''; }
    callback(null, response);
  }

  /**
   * Creates a 'error' node callback
   * @param  {int} code HTTP status code
   * @param  {object} data - to return in the response object
   * @param  {Function} callback
   * @return {Function} callback
   */
  createErrorCallback(code, data, callback) {
    this.closeDb();
    const paramCode = (code == null) ? 400 : code;
    const status = (paramCode >= 400) ? paramCode : 400;
    const response = {
      statusCode: status,
      body: JSON.stringify({ status: 'fail', data }),
    };
    if ((data == null) || (data == '')) { response.body = ''; }
    callback(null, response);
  }

}

export default ServicesModel;
