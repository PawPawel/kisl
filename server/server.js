const express = require('express');
const ActiveDirectory = require('activedirectory');
var bodyParser = require('body-parser');
var crypto = require('crypto');

const app = express();
const nodemailer = require('nodemailer');

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
  var query = 'cn=*';
  var foundUser;    
  ad.findUsers(query, function(err, users) {
	  if (err) {
		console.log('ERROR: ' +JSON.stringify(err));
		return;
    }    
   users.forEach(element => {
    if(element.mail){           
      if(element.mail === req.body.email){
        foundUser= element;   
        
      }
    }
   });     
   if(!foundUser){
   res.json('email not in db');
   return;
  }
   else {        
        const token = crypto.randomBytes(20).toString('hex');        
        var retUser = {
          user: foundUser,
          token: token,
          tokenExpires: Date.now()+360000
        }
        console.log("dane");
        console.log(retUser.user);
        console.log(retUser.token);
        console.log(retUser.tokenExpires);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'askprojekt0@gmail.com',
          pass: 'kotki123!',
        },
      });
      const mailOptions = {
        from: 'ask@gmail.com',
        to: `${retUser.user.mail}`,
        subject: 'Link To Reset Password',
        text:
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
          + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
          + `http://localhost:3031/reset/${retUser.token}\n\n`
          + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
      };
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.error('there was an error sending email: ', err);
        } else {
          console.log('here is the res: ', response);
          res.status(200).json('recovery email sent');
        }
      });
    }
  });
});

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);