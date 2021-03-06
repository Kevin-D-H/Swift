const bcrypt = require('bcrypt');
const validator = require('email-validator');
const db = require('../db');
const accCreator = require('../helper/accountCreator');
const sendEmail = require('../helper/notifications/sendEmail');
const { generateToken, validateToken, tokenState } = require('../helper/tokenHandler');
const { getFavourites, getOrderHistory } = require('../helper/objectBuilder');

const BC_SALT_ROUNDS = 10;

module.exports = {
  loginUser: (reqBody, response) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'email')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'password')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const { email, password } = reqBody;

    // Check that email is valid
    if (!validator.validate(email)) {
      // invalid email
      return response.status(400).send({ status: 400, reason: 'Invalid Email' });
    }

    // Check if user exists
    // TODO: Check if account is active
    return db.query(
      'SELECT person.userid, person.name, person.surname, person.email, person.password,'
      + ' customer.theme FROM public.person'
      + ' INNER JOIN public.customer ON customer.userid = person.userid'
      + ' WHERE person.email = $1::text',
      [email]
    )
      // eslint-disable-next-line consistent-return
      .then((res) => {
        if (res.rows.length === 0) {
          // user does not exist
          return response.status(404).send({ status: 404, reason: 'Not Found' });
        }

        // Check if credentials are correct
        if (bcrypt.compareSync(password, res.rows[0].password)) {
          // good credentials
          const loginResponse = {};
          const newTokenPair = generateToken(res.rows[0].userid);
          loginResponse.token = newTokenPair.token;
          loginResponse.refreshToken = newTokenPair.refreshToken;
          loginResponse.name = res.rows[0].name;
          loginResponse.surname = res.rows[0].surname;
          loginResponse.email = res.rows[0].email;
          loginResponse.theme = res.rows[0].theme;

          // Update token in DB - async
          const loginPromises = [];
          loginPromises.push(db.query(
            'UPDATE public.person SET refreshtoken = $1::text WHERE userid = $2::integer;',
            [bcrypt.hashSync(newTokenPair.refreshToken, BC_SALT_ROUNDS), res.rows[0].userid]
          )
            .catch((err) => {
              console.error('Query Error [Login - Update Account Token]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            }));

          loginPromises.push(getFavourites(res.rows[0].userid).then((favourites) => {
            loginResponse.favourites = favourites;
          }));

          loginPromises.push(new Promise((resolve, reject) => {
            loginPromises.push(getOrderHistory(res.rows[0].userid).then((orderHistoryPromise) => {
              loginResponse.orderHistory = [];
              Promise.all(orderHistoryPromise)
                .then((orderHistoryItem) => {
                  orderHistoryItem.forEach((ordHistItem) => {
                    loginResponse.orderHistory.push(ordHistItem);
                  });
                  resolve();
                })
                .catch((err) => {
                  reject(err);
                });
            }));
          }));

          Promise.all(loginPromises).then(() => response.status(200).send(loginResponse))
            .catch((err) => {
              console.error('Login Promise Error', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        } else {
          // Access denied
          return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
        }
      })
      .catch((err) => {
        console.error('Query Error [Login - Check Account Existence]', err.stack);
        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      });
  },
  addFavourite: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'menuItemId')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token validity
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'SELECT menuitemid FROM public.menuitem WHERE menuitemid = $1::integer;',
        [reqBody.menuItemId]
      )
        .then((res) => {
          if (res.rows.length === 0) {
            // Menu item does not exist
            return response.status(404).send({ status: 404, reason: 'Not Found' });
          }

          // add favourite if it has not already been added
          return db.query(
            'INSERT INTO public.favourite (menuitemid, customerid)'
            + ' SELECT $1::integer, $2::integer WHERE NOT EXISTS'
            + ' (SELECT 1 FROM public.favourite WHERE'
            + ' menuitemid = $1::integer AND customerid = $2::integer);',
            [reqBody.menuItemId, userToken.data.userId]
          )
            .then(() => getFavourites(userToken.data.userId)
              .then((favourites) => response.status(200).send({ favourites }))
              .catch((err) => {
                console.error('Helper Error [Favourite - Get Favourites Object]', err.stack);
                return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
              }))
            .catch((err) => {
              console.error('Query Error [Favourite - Add Favourite Item]', err.stack);
              return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
            });
        })
        .catch((err) => {
          console.error('Query Error [Favourite - Check Menu Item]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  removeFavourite: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'menuItemId')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Check token validity
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      return db.query(
        'DELETE FROM public.favourite WHERE menuitemid = $1::integer AND customerid = $2::integer;',
        [reqBody.menuItemId, userToken.data.userId]
      )
        .then(() => getFavourites(userToken.data.userId)
          .then((favourites) => response.status(200).send({ favourites }))
          .catch((err) => {
            console.error('Helper Error [Favourite - Get Favourites Object]', err.stack);
            return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
          }))
        .catch((err) => {
          console.error('Query Error [Favourite - Remove Favourite Item]', err.stack);
          return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
        });
    }

    if (userToken.state === tokenState.REFRESH) {
      return response.status(407).send({ status: 407, reason: 'Token Refresh Required' });
    }

    // Invalid token
    return response.status(401).send({ status: 401, reason: 'Unauthorised Access' });
  },
  refreshToken: (reqBody, response) => {
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'token')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'refreshToken')
    || Object.keys(reqBody).length !== 3) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    // Test token
    const userToken = validateToken(reqBody.token, true);
    if (userToken.state === tokenState.VALID) {
      // Token still valid
      return response.status(204).send({ status: 204, reason: 'Token Valid' });
    }

    if (userToken.state === tokenState.INVALID) {
      // Invalid token
      return response.status(403).send({ status: 403, reason: 'Invalid Token Pair' });
    }

    // Check token pair
    if (reqBody.refreshToken !== userToken.data.refreshToken) {
      // refresh tokens supplied do not match
      return response.status(403).send({ status: 403, reason: 'Invalid Token Pair' });
    }

    // check refresh token is valid in DB
    return db.query(
      'SELECT refreshtoken FROM public.person WHERE userid = $1::integer;',
      [userToken.data.userId]
    )
      .then((res) => {
        if (res.rows.length === 0) {
        // user/token not found
          return response.status(403).send({ status: 403, reason: 'Invalid Token Pair' });
        }

        if (!bcrypt.compareSync(userToken.data.refreshToken, res.rows[0].refreshtoken)) {
          return response.status(403).send({ status: 403, reason: 'Invalid Token Pair' });
        }

        // All checks passed, issue new token
        const newTokenPair = generateToken(userToken.data.userId);

        // Update DB
        return db.query(
          'UPDATE public.person SET refreshtoken = $1::text WHERE userid = $2::integer;',
          [bcrypt.hashSync(newTokenPair.refreshToken, BC_SALT_ROUNDS), userToken.data.userId]
        )
          .then(() => response.status(201).send(newTokenPair))
          .catch((err) => {
            console.error('Query Error [Tok_Refresh - Update Account Token]', err.stack);
            return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
          });
      })
      .catch((err) => {
        console.error('Query Error [Tok_Refresh - Get Account Token]', err.stack);
        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      });
  },
  registerUser: (reqBody, response, socialRegistration = false) => {
    // Check all keys are in place - no need to check request type at this point
    if (!Object.prototype.hasOwnProperty.call(reqBody, 'name')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'surname')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'email')
    || !Object.prototype.hasOwnProperty.call(reqBody, 'password')
    || Object.keys(reqBody).length !== 5) {
      return response.status(400).send({ status: 400, reason: 'Bad Request' });
    }

    const newUserData = {};
    newUserData.name = reqBody.name;
    newUserData.surname = reqBody.surname;
    newUserData.email = reqBody.email;
    newUserData.password = bcrypt.hashSync(reqBody.password, BC_SALT_ROUNDS); // Hash password
    newUserData.userTheme = 'light'; // Default light theme
    newUserData.refreshToken = 'inactive';

    // Check that email is valid
    if (!validator.validate(newUserData.email)) {
      // invalid email
      if (socialRegistration) {
        return { status: 400, reason: 'Invalid Email' };
      }

      return response.status(400).send({ status: 400, reason: 'Invalid Email' });
    }

    // check if user exists first - be careful of SQL injection
    return db.query(
      'SELECT userid FROM public.person WHERE email = $1::text;',
      [newUserData.email]
    )
      .then((res) => {
        if (res.rows.length > 0) {
          // user exists
          if (socialRegistration) {
            return { status: 409, reason: 'Account Already Exists' };
          }

          return response.status(409).send({ status: 409, reason: 'Account Already Exists' });
        }

        // Create new account
        // TODO: Generate and send user account activation email-DONE
        return accCreator.createCustomer(newUserData)
          .then(() => {
            // sends account activation email
            sendEmail.registrationEmail(newUserData);

            if (socialRegistration) {
              return { status: 201, reason: 'Customer Account Created' };
            }

            return response.status(201).send({ status: 201, reason: 'Customer Account Created' });
          })
          .catch((err) => {
            console.error('Query Error [Register Customer - Create Customer Account]', err.stack);
            if (socialRegistration) {
              return { status: 500, reason: 'Internal Server Error' };
            }

            return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
          });
      })
      .catch((err) => {
        console.error('Query Error [Register Customer - Check Account Availability]', err.stack);
        if (socialRegistration) {
          return { status: 500, reason: 'Internal Server Error' };
        }

        return response.status(500).send({ status: 500, reason: 'Internal Server Error' });
      });
  }
};
