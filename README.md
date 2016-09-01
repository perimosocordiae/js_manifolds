# JS-Manifolds

Bringing the interactivity and accessibility of the web to Manifold Learning.

Live demo is up [on my UMass website](http://people.cs.umass.edu/~ccarey/demos/).

## Dependencies

 * UglifyJS (`npm install -g uglifyjs`)

## Usage

To check that everything is working,
just open `index.html` in a web browser.

To build a standalone, minified file, run `make`.
The resulting `manifolds.min.js` can then be included on a website.

## TODO List

 * Wrap the code into a nicer module
 * Detect disconnected components and handle them more nicely
   * Current Isomap implementation blows up with `NaN`s
 * Locally Linear Embedding
 * Tweak colors for better visibility

