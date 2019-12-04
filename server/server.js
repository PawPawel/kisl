const express = require('express');
const ActiveDirectory = require('activedirectory');
var bodyParser = require('body-parser');
var crypto = require('crypto');
const jwt  = require('jsonwebtoken');
const fs   = require('fs');

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

var resetTokens = [];

app.post('/api/auth', (req, res) => {
  var decipher = crypto.createDecipher('aes-256-ctr', req.body.username);
  var dec = decipher.update(req.body.password,'hex','utf8')
  dec += decipher.final('utf8');

  ad.authenticate(req.body.username, dec, function(err, auth) {
    if (err) {
      console.log('ERROR: '+JSON.stringify(err));
      res.json('failed');
      return;
    }
    if (auth) {
      console.log('Authenticated!');
      var issuer = req.headers.origin;
      var sub = req.body.username;
      var aud =req.headers['x-forwarded-host'];

      var signOptions = {
        issuer:  issuer,
        subject:  sub,
        audience:  aud,
        expiresIn:  "10m",
        algorithm:  "RS256"
       };
       var payload = {
         user: req.body.username
       }
       var privateKEY  = fs.readFileSync('./dummyPrivate.key', 'utf8');

       var token = jwt.sign(payload, privateKEY, signOptions);
      res.json(token);
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
	 
	  if (!user) console.log('User: ' + req.body.username + ' not found.');
	  else {
		  res.json(user);
	  }
	});
 });
});

function verify(token, data){
  var verifyOptions = {
    issuer:  data.issuer,
    subject:  data.subject,
    audience:  data.audience,
    expiresIn:  "10m",
    algorithm:  ["RS256"]
   };
   var publicKEY  = fs.readFileSync('./dummyPublic.key', 'utf8');
   console.log("data: ", data)
   console.log(jwt.decode(token))
   try {
    return jwt.verify(token, publicKEY, verifyOptions);
   } catch(err){
     console.log(err);
     return false;
   }
}

app.post('/api/validateToken', (req, res) => {
  let data = {
    issuer: req.headers.origin,
    subject: req.body.username,
    audience: req.headers['x-forwarded-host']
  }
  //console.log("data",data);
  let result = verify(req.body.token, data)
  //console.log("result", result);
  if(result){
    console.log("verified");
    res.json('verified')
  } else{
    res.json('invalid')
  }
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

app.post('/api/reset_token', (req, res) => {
  //console.log(req.body.resetPasswordToken);  
  // var verifyOptions = {
  //   issuer:  req.headers.origin,
  //   subject:  foundUser.sAMAccountName+'@ask.local',
  //   audience:  req.headers['x-forwarded-host'],
  //   expiresIn:  "1h",
  //   algorithm:  "RS256"
  //  };
  // var publicKEY  = fs.readFileSync('./dummyPublic.key', 'utf8');
  // let result = jwt.verify(token, publicKEY, verifyOptions);

  // var passed=false;
  // resetTokens.forEach(element => {
  //   if(element.token === req.body.resetPasswordToken){           
  //     element = token_mail_pair;
  //     found=true;
  //   }
  //  });
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
   return;
  }
   else {       
    var signOptions = {
      issuer:  req.headers.origin,
      subject:  foundUser.sAMAccountName+'@ask.local',
      audience:  req.headers['x-forwarded-host'],
      expiresIn:  "1h",
      algorithm:  "RS256"
    };          
    var payload = {
      username: foundUser.sAMAccountName
     }
    var privateKEY  = fs.readFileSync('./dummyPrivate.key', 'utf8');    
    var jwt_token = jwt.sign(payload, privateKEY, signOptions);    

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'askprojekt0@gmail.com',
          pass: 'kotki123!',
        },
      });
      const mailOptions = {
        from: 'ask@gmail.com',
        to: `${foundUser.mail}`,
        subject: 'Link To Reset Password',
        text:
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
          + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
          + `http://localhost:3001/reset/${jwt_token}\n\n`
          + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
      };
      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.error('there was an error sending email: ', err);
        } else {
          console.log('here is the res: ', response);
          res.status(200).json(jwt_token);

          const token_mail_pair={
            token: jwt_token,
            mail: foundUser.mail
          }
          var found=false;
          resetTokens.forEach(element => {
            if(element.mail === token_mail_pair.mail){           
              element = token_mail_pair;
              found=true;
            }
           }); 
           if(found===false){
            resetTokens.push(token_mail_pair);
           }         

          const path = `/reset/${jwt_token}`;
          this.props.history.push(path);
        }
      });
    }
  });
});

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);