import Sequelize from "sequelize";
import LambdaEnvVars from "lambda-env-vars";

const lambdaEnvVars = new LambdaEnvVars();

class BooksModel {
  /**
   * Constructor for Credits.
   *
   * @return  {object}  - Returns the current object.
   */
  constructor(db) {
    this.db = db;
    this.booksModel = this.defineBookSchema();
    return this;
  }

  /**
   * Function to create the table definition
   * @return {object} model of the table
   */
  defineBookSchema() {
    const model = this.db.define(
      "book",
      {
        title: {
          type: Sequelize.STRING
        },
        author: {
          type: Sequelize.STRING
        },
        year: {
          type: Sequelize.INTEGER
        },
        pages: {
          type: Sequelize.INTEGER
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      },
      {}
    );
    return model;
  }

  addBooks(body) {
    const { title, author, year, pages } = body;
    return new Promise((resolve, reject) => {
      this.booksModel
        .create({
          title,
          author,
          year,
          pages
        })
        .then(book => {
          let response = {
            message: book,
            code: 200
          };
          resolve(response);
        })
        .catch(e => {
          reject(new Error(`Something Went Wrong ${e}`));
        });
    });
  }

  deleteBooks(id) {
    return new Promise((resolve, reject) => {
      this.booksModel
        .find({
          where: {
            id: id
          }
        })
        .then(item => {
          if (item && item.id) {
            return item;
          } else {
            let response = {
              message: "Not Found",
              code: 404
            };
            reject(response);
          }
        })
        .then(q => {
          this.booksModel
            .destroy({
              where: {
                id: q.id
              }
            })
            .then(book => {
              let response = {
                message: book,
                code: 200
              };
              resolve(response);
            });
        })
        .catch(e => {
          reject(new Error(`Something Went Wrong ${e}`));
        });
    });
  }

  updateBooks(body, id) {
    return new Promise((resolve, reject) => {
      this.booksModel
        .findOne({
          where: {
            id: id
          }
        })
        .then(item => {
          if (item && item.id) {
            return item;
          } else {
            let response = {
              message: "Not Found",
              code: 404
            };
            reject(response);
          }
        })
        .then(OldBookItem => {
          OldBookItem.update(body)
            .then(book => {
              let response = {
                message: book,
                code: 200
              };
              resolve(response);
            })
            .catch(e => {
              reject(new Error(`Something Went Wrong${e}`));
            });
        })
        .catch(e => {
          reject(new Error(`Something Went Wrong ${e}`));
        });
    });
  }

  getBooks() {
    return new Promise((resolve, reject) => {
      this.booksModel
        .findAll({})
        .then(allBooks => {
          let response = {
            message: allBooks,
            code: 200
          };
          resolve(response);
        })
        .catch(e => {
          reject(new Error(`Something Went Wrong ${e}`));
        });
    }).catch(e => {
      reject(new Error(`Something Went Wrong ${e}`));
    });
  }
}

export { BooksModel };
