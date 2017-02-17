const express = require('express'); 
const hbs = require('hbs');
const fs = require('fs'); // we'll be logging to a file 

// this is to make our app compatible with both heroku and locally. process.env stores all the available env variable available on our OS
const port = process.env.PORT || 3000; // if the PORT env is not available, this will use port 3000

// make a new express app
var app = express();

// register partials path 
hbs.registerPartials(__dirname + '/views/partials');

// key-value pair. set the view engine to use hbs. 
app.set('view engine', 'hbs'); // this lets us set some various express related configurations and a lot of built-in ones.

// some more middleware
app.use((request, response, next) => {
    // request and response is the exact same argument when we do the get routes below

    // next exists so you can tell when your middleware is done. this is useful because you can have as many middlewares in your app as you like

    // inside of this function we can do anything like logging something to the screen, or make a database request to make sure a user is authenticated. all of that is valid. then we use next to tell express when we're done. If your middleware don't call next, the lines below won't be executed and your app will just hang. 

    // we'll make this middleware log out all the requests that's coming in to the server
    var now = new Date().toString(); // creates a nice readable date by calling toString()
    var log = `${now}: ${request.method} ${request.url}`;
    console.log(log); // method: get or post | url: is the path/page the client requested
    // save it to a log file
    fs.appendFile('server.log', log + '\n', (error) => {
        if (error) {
            console.log('Unable to append to server.log');
        }
    });

    next();
});

// middleware example for when you don't want to call next() such as when your website is under maintenance
app.use((request, response, next) => {
    response.render('maintenance.hbs');
    // we're not calling next() since we want the app to stop after displaying the maintenance page. 
});

// let's use middlware to serve up our web/html page without needing to configure the routes
app.use(express.static(__dirname + '/public')) // dirname stores a path to your project's directory. in this case, it's the path of node-web-server

// register handlebars helpers. 2 args: name of the helper and the function to run   
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

// it is also possible to reigster a helper that takes an argument
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

// setup http route handlers
// requires a path and a function to run (function that tells express what to send back to the person who made the request). just / means the root
app.get('/', (request, response) => { // function will be called with 2 args, request(stores a ton of information about the request coming in like headers, body info, etc) and response(has a bunch of methods available to you so you can respond to the http request in whatever way you like. you can customize what data you send back, you can set your http status codes, etc. this will be explored in detail later in the course)
    
    // this will let us respond to the request, sending data back to the requester 
    //response.send('Hello express');

    //response.send('<h1>Hello express</h1>'); // you can also send back html code

    // we can also send json data back. if you pass in an object, express automatically converts it to JSON.  
    // response.send({
    //     name: 'some name',
    //     likes: [
    //         'Gago-ing',
    //         'Tarantado-ing'
    //     ]
    // });

    // challenge: display home.hbs using the template engine
    response.render('home.hbs', {
        pageTitle: 'Home page',
        greeting: 'Welcome to this web page. Tangina mo'
    });
})

// let's create another route 
app.get('/about', (request, response) => {
    //response.send('About page');

    // let's use hbs to render the about page
    response.render('about.hbs', {
        pageTitle: 'About page',
    });  // this will let you render any of your template files you have setup with your current view engine. it also allows a 2nd argument which you can pass an object with key-value pairs so that you can access them in your hbs files 
});

// challenge, create a bad route, send back a json data with an errorMessage property
app.get('/bad', (request, response) => {
    response.send({
        errorMessage: 'Unable to process this request'
    });
});

// this will bind our application to a port on our machine
app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
}); // 3000 is a common port for developing locally