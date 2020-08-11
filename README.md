# Angular TailwindCSS Schematics

This schematic will add [TailwindCSS](https://tailwindcss.com/) to your [Angular](https://angular.io) application.

## Usage

```
ng add @nartc/tailwind-schematics
```

## Limitation

- [AngularCLI](https://cli.angular.io)-powered projects only
- No prior **Custom Webpack** configuration setup with [@angular-builders/custom-webpack](https://github.com/just-jeb/angular-builders/tree/master/packages/custom-webpack)

## Schematic details

### Options
|name|type|default|description|
|----|----|-------|-----------|
|configDirectory|string|.|The location where the config files (TailwindCSS and Webpack) will be stored|
|tailwindConfigFileName|string|tailwind.config|File name of TailwindCSS Config|
|usePurgeCss|boolean|true|Setup PurgeCSS in Production build|
|cssFlavor|string|css|The CSS flavor the project is using|

### Dependencies

The schematic will add the following packages to `devDependencies` and install:
- `@angular-builders/custom-webpack`
- `tailwindcss`
- `postcss-import`
- `postcss-loader`
- `@fullhuman/postcss-purgecss` if `usePurgeCss` is `true`
- `postcss-<cssFlavor>`: if `cssFlavor !== 'css'`, then a `postcss-<cssFlavor>` will be added as well  

### Configuration Files

#### TailwindCSS Config

The schematic uses `tailwindConfigFileName` to generate a `<tailwindConfigFileName>.js` file as [TailwindCSS Configuration](https://tailwindcss.com/docs/configuration). The default content is as follows:

```js
module.exports = {
  prefix: '',
  separator: ':',
  theme: {}
}
```

#### Webpack Config

Webpack configuration is generated based on `usePurgeCss`

- With `PurgeCSS`
    - `webpack-dev.config.js`: Development Webpack configuration file
    - `webpack-prod.config.js`: Production Webpack configuration file with `purgecss` setup 
- Without `PurgeCSS`
    - `webpack.config.js`: A single Webpack configuration file to be used in both Development and Production environment
    
#### `angular.json`

The schematic will modify `angular.json` file to use `@angular-builders/custom-webpack` instead of the default `@angular-devkit/build-angular` with the proper `customWebpackConfig.path` based on the `configDirectory` and **Webpack Config** above. Before and after are as follows:

```json
{
  "architect": {
    "build": {
      "builder": "@angular-devkit/build-angular:browser"
    }
  }
}
```

```json
{
  "architect": {
    "build": {
      "builder": "@angular-builders/custom-webpack:browser",
      "options": {
        "customWebpackConfig": {
           "path": "webpack-dev.config.js"
        }
      }   
    }
  }
}
```

#### `styles.<cssFlavor>`

The schematic will also update the main `styles.<cssFlavor>` to include `@import` from TailwindCSS

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

## Acknowledgement

- [Total Guide to Custom Angular Schematics](https://medium.com/@tomastrajan/total-guide-to-custom-angular-schematics-5c50cf90cdb4)
- [ng add Schematic](https://brianflove.com/2018-12-15/ng-add-schematic/)
- [@santosh](https://twitter.com/SantoshYadavDev) for quick and concise answers to my questions

## References

- [Angular Schematics](https://angular.io/guide/schematics)

## Contribution

Any contribution is welcome
