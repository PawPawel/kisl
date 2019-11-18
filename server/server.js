const express = require('express');
const ActiveDirectory = require('activedirectory');
var bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

var config = { url: 'ldap://ask.local',
               baseDN: 'dc=domain,dc=com',
               username: 'username@domain.com',
               password: 'password' }

var ad = new ActiveDirectory(config);

app.post('/api/activedirectory', (req, res) => {
  console.log(req.body);
  ad.authenticate('aa', 'bb', function(err, auth) {
    if (err) {
      console.log('ERROR: '+JSON.stringify(err));
      res.json('failed');
      return;
    }
    if (auth) {
      console.log('Authenticated!');
      res.json('authenticated');
    }
    else {
      console.log('Authentication failed!');
      res.json('failed');
    }
 });

});

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);