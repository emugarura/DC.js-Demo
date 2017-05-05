var express = require('express');
var app = express();
var bodyParser =require('body-parser');
var path = require('path');

require('./server/config/mongoose.js');

app.use(bodyParser.json());
app.use(express.static(__dirname + "/client/static"))
app.use('/node_modules', express.static(__dirname + '/node_modules/'));



var routes_setter = require('./server/config/routes.js');
routes_setter(app);

app.listen(8000,function(){
  console.log('Crossfilter Test on port 8000')
})
