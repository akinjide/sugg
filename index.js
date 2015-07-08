var express    = require('express'),
    app        = express();

var bodyParser = require('body-parser'),
    port       = process.env.PORT || 4000;

app.use(express.static(__dirname + '/public'));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.get('*', function(req, res) {
  res.sendFile(process.cwd() + '/public/index.html');
});

app.listen(port);
console.log('now listening on port: ' + port)