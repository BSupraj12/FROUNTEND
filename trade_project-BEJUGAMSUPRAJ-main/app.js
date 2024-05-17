// require modules
const mongoose = require('mongoose');
const express = require('express');
var bodyParser = require('body-parser');

const morgan = require('morgan');                       // TODO: remove this package
const methodOverride = require('method-override');      // TODO: remove this package

const tradeRoutes = require('./routes/tradeRoutes');
const mainRoutes = require('./routes/mainRoutes');
const restRoutes = require('./routes/restRoutes');

// below script to connect with monogodb
mongoose.connect("mongodb://127.0.0.1:27017/milestone3_db").then(() => {
    console.log("MongoDB connected!");
}).catch((error) => {
    console.log("Error occurred while connecting to mongodb: " + err);
});

//create app
const app = express();

//configure app
let port = 1209;
app.set('view engine', 'ejs');

//mount middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static('public'));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.use('/', mainRoutes);
app.use('/trades', tradeRoutes);
app.use('/api', restRoutes);

app.listen(port, () => {
    console.log(`running server on port ${port}`);
});

app.on('error', onError);

function onError(error) {
    // for showing error log in console
    console.log(error);
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges, error in app.js');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use, error in app.js');
            process.exit(1);
            break;
        default:
            throw error;
    }
}