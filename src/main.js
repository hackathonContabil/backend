require('dotenv').config();
require('express-async-errors');

const AppLauncher = require('./appLauncher');
const appLauncher = new AppLauncher();
appLauncher.bootstrap();
