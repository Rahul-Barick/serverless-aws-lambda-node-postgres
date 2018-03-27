import { BooksModel } from "./models/book";
import ServiceModel from "./models/service-model";
import ServiceModelConfig from "./config/constant";

const postBook = (event, context, callback) => {
  let serviceModel = new ServiceModel(ServiceModelConfig);
  let bookModel = new BooksModel(serviceModel.getDb());
  if (typeof event.body === "string") {
    try {
      var reqBody = JSON.parse(event.body);
    } catch (e) {
      new Error("Could not parse Data");
    }
  }
  return bookModel
    .addBooks(reqBody)
    .then(results => {
      return serviceModel.createSuccessCallback(
        results.code,
        results.message,
        callback
      );
    })
    .catch(e => {
      if (
        Object.prototype.hasOwnProperty.call(e, "code") &&
        Object.prototype.hasOwnProperty.call(e, "message")
      ) {
        return serviceModel.createErrorCallback(e.code, e.message, callback);
      } else {
        return serviceModel.createErrorCallback(
          500,
          "Internal Server Error!!!",
          callback
        );
      }
    });
};

const deleteBook = (event, context, callback) => {
  let id = event.pathParameters.Id;
  let serviceModel = new ServiceModel(ServiceModelConfig);
  let bookModel = new BooksModel(serviceModel.getDb());
  return bookModel
    .deleteBooks(id)
    .then(results => {
      return serviceModel.createSuccessCallback(
        results.code,
        results.message,
        callback
      );
    })
    .catch(e => {
      if (
        Object.prototype.hasOwnProperty.call(e, "code") &&
        Object.prototype.hasOwnProperty.call(e, "message")
      ) {
        return serviceModel.createErrorCallback(e.code, e.message, callback);
      } else {
        return serviceModel.createErrorCallback(
          500,
          "Internal Server Error!!!",
          callback
        );
      }
    });
};

const updateBook = (event, context, callback) => {
  let serviceModel = new ServiceModel(ServiceModelConfig);
  let bookModel = new BooksModel(serviceModel.getDb());
  if (typeof event.body === "string") {
    try {
      var reqBody = JSON.parse(event.body);
    } catch (e) {
      new Error("Could not parse Data");
    }
  }
  return bookModel
    .updateBooks(reqBody, event.pathParameters.Id)
    .then(results => {
      return serviceModel.createSuccessCallback(
        results.code,
        results.message,
        callback
      );
    })
    .catch(e => {
      if (
        Object.prototype.hasOwnProperty.call(e, "code") &&
        Object.prototype.hasOwnProperty.call(e, "message")
      ) {
        return serviceModel.createErrorCallback(e.code, e.message, callback);
      } else {
        return serviceModel.createErrorCallback(
          500,
          "Internal Server Error!!!",
          callback
        );
      }
    });
};

const getAllBooks = (event, context, callback) => {
  let serviceModel = new ServiceModel(ServiceModelConfig);
  let bookModel = new BooksModel(serviceModel.getDb());
  return bookModel
    .getBooks()
    .then(results => {
      return serviceModel.createSuccessCallback(
        results.code,
        results.message,
        callback
      );
    })
    .catch(e => {
      if (
        Object.prototype.hasOwnProperty.call(e, "code") &&
        Object.prototype.hasOwnProperty.call(e, "message")
      ) {
        return serviceModel.createErrorCallback(e.code, e.message, callback);
      } else {
        return serviceModel.createErrorCallback(
          500,
          "Internal Server Error!!!",
          callback
        );
      }
    });
};

export { postBook, deleteBook, updateBook, getAllBooks };
