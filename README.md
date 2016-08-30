# JS-Manifolds

Bringing the interactivity and accessibility of the web to Manifold Learning.

Live demo is up [on my UMass website](http://people.cs.umass.edu/~ccarey/demos/).

## Dependencies

 * UglifyJS (`npm install -g uglifyjs`)

## Usage

    make dev
    open index.html

## TODO List

 * Detect disconnected components and handle them more nicely
   * Current implementation blows up with `NaN`s
 * Laplacian Eigenmaps
 * Locally Linear Embedding
 * Tweak colors for better visibility
