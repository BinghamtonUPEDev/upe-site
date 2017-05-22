# UPE Website

## Development

You can develop the site as a Node.js app.

1) Fork the repository.
2) Install all required packages using `npm install`.
3) Type `npm run dev` to run the application locally.

## Updating EBoard and other content

1) Go modify the listing in the variable `app.locals.eboard` in `app/app.js`.
2) See "Generating the Static Site" below for generating the static site.
3) SFTP into the server and replace the html files.

**Note:** You can always modify the html directly for some content, or work with the Node.js app and generate the static site after.

## Generating the Static Site

Type `npm run generate` to add the COMPILE flag that allows generating the static site in /static. You can check out the code for creating the static site in `app/app.js`.

**Note:** You may need to make changes to the static site generation for dynamic content fetching where necessary. For instance, fetching images is done via async and must be copied over so that pug has that information when it writes the html out.
