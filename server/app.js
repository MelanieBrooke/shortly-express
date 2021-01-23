const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const _ = require('underscore');
const db = require('./db');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/signup',
  (req, res) => {
    res.render('signup');
  });

app.get('/login',
  (req, res) => {
    res.render('login');
  });

app.post('/signup',
  (req, res) => {
    models.Users.create(req.body)
      .then( (data) => {
        if (data === 'exists') {
          res.set('location', '/signup');
          res.render('signup');
        } else {
          res.set({'location': '/'});
          res.render('index');
        }
      })
      .catch( (err) => {
        console.log('err -> ', err);
      } );
  });
//
app.post('/login',
  (req, res) => {
    models.Users.getAll('users')
      .then( (users) => {
        var userStr = JSON.stringify(req.body.username);
        var passStr = JSON.stringify(req.body.password);
        var username = req.body.username;
        var password = req.body.password;
        var usernameExists = false;
        users.forEach( (user) => { if (user.username === username) { usernameExists = true; } });
        if (usernameExists) {
          var salt;
          var hashedPassword;
          models.Users.getSalt(userStr)
            .then((data) => {
              salt = data[0].salt;
              return models.Users.getPassword(userStr);
            } )
            .then((hashPass) => {
              hashedPassword = hashPass[0].password;
              return {'hashedPassword': hashedPassword, 'salt': salt};
            })
            .then((passAndSalt) => {
              var matches = utils.compareHash(password, passAndSalt.hashedPassword, passAndSalt.salt);
              if (matches) {
                res.set({'location': '/'});
                res.render('index');
              } else {
                res.set({'location': '/login'});
                res.render('login');
              }
            })
            .catch ( (err) => {
              if (err) { console.log('err -> ', err); }
            });
        } else if (!usernameExists) {
          res.set({'location': '/login'});
          res.render('index');
        }
      });
    // need make a get all fucntion
    /*
     handle log in first
          if username and password match redirect to '/'
     handle if user does not exist second
           if username exists but password odes not match do refresh log in page '/login'
     handle if password does not match third
           if password does not match rerender  log in
  */

  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }
    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
