const express = require('express');
const router = express.Router();
const Mailgun = require('mailgun-js');

//Your api key, from Mailgun’s Control Panel
const api_key  = '@';
//Your domain, from the Mailgun Control Panel
const domain   = '@';
//Your sending email address
const from_who = 'rawkstar@eclipse.net';

//Do something when you're landing on the first page
router.get('/', function(req, res) {
    //render the index.jade file - input forms for humans
    res.render('index', { title: 'Express.js' }, function(err, html) {
        if (err) {
            // log any error to the console for debug
            console.log(err); 
        }
        else { 
            //no error, so send the html to the browser
            res.send(html)
        };
    });
});

// Send a message to the specified email address when you navigate to /submit/someaddr@email.com
// The index redirects here
router.post('/submit/:mail', function(req,res) {
    //We pass the api_key and domain to the wrapper, or it won't be able to identify + send emails
    const mailgun = new Mailgun({apiKey: api_key, domain: domain});
    const data = {
      //Specify email data
      from: from_who,
      //The email to contact
      to: req.params.mail,
      //Subject and text data  
      subject: 'Hello from ' + req.body.firstName,
      html: req.body.formMessage
    }
    //Invokes the method to send emails given the above data with the helper library
    mailgun.messages().send(data, function (err, body) {
        //If there is an error, render the error page
        if (err) {
            res.render('error', { error : err});
            console.log("got an error: ", err);
        }
        //Else we can greet    and leave
        else {
            //Here "submitted.jade" is the view file for this landing page 
            //We pass the variable "email" from the url parameter in an object rendered by Jade
            res.render('submitted', { email : req.params.mail });
            console.log(body);
        }
    });
});
















router.get('/validate/:mail', function(req,res) {
    const mailgun = new Mailgun({apiKey: api_key, domain: domain});
    const members = [
      {
        address: req.params.mail
      }
    ];
//For the sake of this tutorial you need to create a mailing list on Mailgun.com/cp/lists and put its address below
    mailgun.lists('NAME@MAILINGLIST.COM').members().add({ members: members, subscribed: true }, function (err, body) {
      console.log(body);
      if (err) {
            res.send("Error - check console");
      }
      else {
        res.send("Added to mailing list");
      }
    });
});

router.get('/invoice/:mail', function(req,res){
    //Which file to send? I made an empty invoice.txt file in the root directory
    //We required the path module here..to find the full path to attach the file!
    const path = require("path");
    const fp = path.join(__dirname, 'invoice.txt');
    //Settings
    const mailgun = new Mailgun({apiKey: api_key, domain: domain});
    const data = {
      from: from_who,
      to: req.params.mail,
      subject: 'An invoice from your friendly hackers',
      text: 'A fake invoice should be attached, it is just an empty text file after all',
      attachment: fp
    };
    //Sending the email with attachment
    mailgun.messages().send(data, function (error, body) {
        if (error) {
            res.render('error', {error: error});
        }
        else {
            res.send("Attachment is on its way");
            console.log("attachment sent", fp);
        }
    });
});


module.exports = router;
