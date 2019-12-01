const express = require('express');
const ActiveDirectory = require('activedirectory');
var bodyParser = require('body-parser');
var crypto = require('crypto');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

var config = { url: 'ldap://192.168.56.103',
               baseDN: 'dc=ask,dc=local',
               username: 'administrator@ask.local',
               password: 'kotki123!'
            }

var ad = new ActiveDirectory(config);

app.post('/api/auth', (req, res) => {
  var decipher = crypto.createDecipher('aes-256-ctr', req.body.username);
  var dec = decipher.update(req.body.password,'hex','utf8')
  dec += decipher.final('utf8');

  console.log(req.body);
  ad.authenticate(req.body.username, dec, function(err, auth) {
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
 
 app.post('/api/user', (req, res) => {
  ad.findUser(req.body.username, function(err, user) {
	  if (err) {
		console.log('ERROR: ' +JSON.stringify(err));
		return;
	  }
	 
	  if (! user) console.log('User: ' + req.body.username + ' not found.');
	  else {
		  res.json(user);
	  }
	});
 });
});

 app.post('/api/groups', (req, res) => {
  ad.getGroupMembershipForUser(req.body.username, function(err, groups) {
	if (err) {
		console.log('ERROR: ' +JSON.stringify(err));
		return;
	}
 
    if (! groups) console.log('User: ' + req.body.username + ' not found.');
    else res.json(groups);
 });
});

app.post('/api/findEmail', (req, res) => {
  console.log(req.body);
  ad.find(req.body.email, function(err, user) {
    console.log(user.user);
    if (err) {
      console.log('ERROR: ' +JSON.stringify(err));
      return;
    }
  });
  
});

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);