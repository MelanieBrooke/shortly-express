const utils = require('../lib/hashUtils');
const Model = require('./model');
const db = require('../db');
const _ = require('lodash');

/**
 * Users is a class with methods to interact with the users table, which
 * stores information (id, username, hashed password, salt) about users.
 * @constructor
 * @augments Model
 */
class Users extends Model {
  constructor() {
    super('users');
  }

  /**
   * Compares a password attempt with the previously stored password and salt.
   * @param {string} attempted - The attempted password.
   * @param {string} password - The hashed password from when the user signed up.
   * @param {string} salt - The salt generated when the user signed up.
   * @returns {boolean} A boolean indicating if the attempted password was correct.
   */
  compare(attempted, password, salt) {
    return utils.compareHash(attempted, password, salt);
  }

  /**
   * Creates a new user record with the given username and password.
   * This method creates a salt and hashes the password before storing
   * the username, hashed password, and salt in the database.
   * @param {Object} user - The user object.
   * @param {string} user.username - The user's username.
   * @param {string} user.password - The plaintext password.
   * @returns {Promise<Object>} A promise that is fulfilled with the result of
   * the record creation or rejected with the error that occured.
   */
  executeQuery (query, values) {
    return db.queryAsync(query, values).spread( (results) => results);
  }

  getAll(tablename) {
    let queryString = `SELECT username FROM ${tablename}`;
    return this.executeQuery(queryString);
  }





  create({ username, password }) {



    // check if user exists in database

    // if user exists use window.location.replace("http://127.0.0.1:4568/signup");
    // console.log('users -> ', Users);
    //invoke getAll method on a usersTable

    console.log('this = ', this);
    console.log('username = ', username);


    this.getAll('users')
      .then( (data) => {
        console.log('data -> ', data);
        // iterate over data
        return data.forEach( (object) => {
          if (username === object.username) {
            $(location).attr('href', 'http://127.0.0.1:4568/signup');
          }
        });
      });

    // get usernma s from above function ^^^ somehow

    // if username in above paramater matches any of the username returned from above function
    // we redirect the web page to /signup



    let salt = utils.createRandom32String();

    let newUser = {
      username,
      salt,
      password: utils.createHash(password, salt)
    };

    return super.create.call(this, newUser);
  }
}

module.exports = new Users();
