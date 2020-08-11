module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          plugins: () => [
            require('postcss-import'),
            require('tailwindcss')('./configs/tailwind.config.js'),
            require('autoprefixer'),
          ]
        }
      }
    ]
  }
};
