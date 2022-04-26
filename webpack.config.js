const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'quill1-table.js',
        library: 'quill1Table',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        quill: 'quill',
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['es2015'],
                        plugins: [
                            'transform-runtime',
                        ],
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'quill1-table.js.map',
        }),
    ]
};
