# parcel-resolver-modernizr

A [Parcel](https://github.com/parcel-bundler/parcel) resolver for custom [Modernizr](https://github.com/Modernizr/Modernizr) builds, migrate/inspired in [parcel-plugin-modernizr](https://github.com/hirasso/parcel-plugin-modernizr/)

## Installation

#### Using NPM

```
$ npm install parcel-resolver-modernizr -D
```

This plugins needs Modernizr to be installed in your project devDependencies

## Setup

1. Create a file `modernizr-config.json` (you can also use `.modernizrrc`) in your project root folder with your desired Modernizr configuration. You can also use [Modernizr](https://modernizr.com/download) to generate a custom configuration for your project.

2. Include "parcel-resolver-modernizr" in your .parcelrc config file, remember to add all the resolvers previously configured

```
{
  "extends": "@parcel/config-default",
  "resolvers": ["parcel-resolver-modernizr", "..."]
}
```

## Usage: Embedded in html, similar to [parcel-plugin-modernizr](https://github.com/hirasso/parcel-plugin-modernizr) usage option 1

./src/index.html:

```html
<script type="module" src="modernizr.js"></script>
```

./src/modernizr-config.json: Your modernizr config

```
$ parcel ./src/index.html
```

#### Output

1. ./dist/index.html:

   ```html
   <script src="modernizr.contentHash.js"></script>
   ```

2. ./dist/index.contentHash.js: Your custom modernizr build

## Limitations

1. package.json option is currently unavailiable
2. resource name 'modernizr.js' is not configurable

## Contributing

Pull requests are welcome!
