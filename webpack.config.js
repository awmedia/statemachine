const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-source-map',
    entry: {
        statemachine: './source/StateMachine.js'
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/build/',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel'],
                include: path.resolve(__dirname, 'source/')
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': JSON.stringify('production') }}),
        new webpack.optimize.UglifyJsPlugin({ include: /\.min\.js$/, minimize: false })
    ]
};
