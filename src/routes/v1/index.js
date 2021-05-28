const authRouter = require('./auth');
const boilerplateRouter = require('./boilerplate');
const userRouter = require('./user');

const isAuthenticated = require("../../helper/isAuthenticated")

module.exports = function(app) {

    app.use(`/v1/auth`, authRouter);

    // Now all api is authenticate
    app.use(`/v1/user`, isAuthenticated, userRouter);


    app.use(`/v1/boilerplate`, isAuthenticated, boilerplateRouter);
  
}