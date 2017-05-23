# UPE Website

## Development

You can develop the site as a Node.js app.

### Setting up

1) Fork the repository.

You need the files after all!

2) Install all required packages using `npm install`.

`package.json` details information about this project, including dependencies. You can install them with the command `npm install` or `npm i` for short.

3) Type `npm run dev` to run the application locally.

This is a custom script that you can find written in `package.json`. What makes it different from `npm run generate` is the custom flag that we add to force our app to run a specific code segment that will generate the static site and exit.

### Available custom scripts

`"start": "node app/app.js",`

This just runs the Node.js app normally.

`"dev": "./node_modules/.bin/nodemon app/app.js",`

This runs the Node.js app using the developer dependency listed in `package.json` called Nodemon. Nodemon will automatically restart your local server as you make changes to the app. This is useful for development, hence why we call it `dev`.

`"generate": "COMPILE=true node app/app.js"`

This generates the static site. In `app/app.js`, there is a condition check for an environment variable called 'COMPILE'. We set that above to force the branch into the code segment where we generate the static site.

## How does the static site generation work?

We have routes for our app. [Check out Express' documentation.](https://expressjs.com/en/starter/basic-routing.html)

If I want to visit the tutoring page, I click on the navigation item that links to "/tutoring" on the website. This translates into the function call in `routes/general.js` below:

```
app.get('/tutoring', function(req, res) {
    res.render('tutoring');
});
```

The app sees a get request on '/tutoring' and then executes the callback where we have access to the request object. We want to render the 'tutoring' view, stored in `views/`. We are using the pug template engine, so when we get back our page on the client side, it's just html. What we're writing in these .pug files is shorthand notation as per pug's syntax for html, but the engine will translate it to actual html when the request to '/tutoring' is made. This allows us to also pass in data that pug can traverse or perform condition checks on.

We can explicitly do this conversion to html ourselves by calling `pug.render`, where pug is the pug dependency that we loaded in with `require`. As such, we can build out our static website by making the appropriate calls to pug and moving the assets (e.g. images, css, js, etc.) that we depend on.

## Customizing content

Most of the important configurations can be found in `app/app.js`. Parts that can be edited or extended are marked in the comments. Examples include:

- Setting up pages in the navigation
- Updating eboard positions
- Extending the code segment where static site generation happens

When the static site has been generated, just SFTP the files in `static/` over to the server.

**Warning: If you modify the html directly, those changes won't be reflected in the pug templates. As such, future runs of generating the static site will not incorporate those changes.**

## Generating the Static Site

Type `npm run generate` to add the COMPILE flag that allows generating the static site in /static. You can check out the code for creating the static site in `app/app.js`.

## Other Notes

You may need to make changes to the code segment in `app/app.js` where static site generation happens. Pug templates that depend on data being passed through the routes will need that same data when we call `pug.render`, so we need to copy over the code that sets up that dat. For instance, fetching images is done via async in the routes. We must copy it over so that pug has that same information when it writes the html out that it would otherwise get via the routes when running as a Node.js app. To avoid redundancy, consider moving any code that fetches content to a general function that you can export and then call from anywhere, whether it be routes when in local app development or in the static site generation segment of `app/app.js` for generating the static site and emulating those route calls.
