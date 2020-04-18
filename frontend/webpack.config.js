var webpack = require('webpack');
module.exports = {
	entry:{
		main: './source/app.js'
	},
	output: {
		path: __dirname + '/build',
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
        test: /.js?$/,
				use: {
					loader: 'babel-loader'
				},
        exclude: /node_modules/
		}]
  },
	optimization: {
    minimize: true
  }
};
