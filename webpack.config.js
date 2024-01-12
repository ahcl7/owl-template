const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const host = process.env.HOST || "localhost";

module.exports = function (env, argv) {
    const mode = argv.mode || "development";
    return {
        mode: mode,
        entry: "./src/main.js",
        output: {
            filename: "main.js",
            path: path.resolve(__dirname, "dist"),
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    loader: "babel-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                insert: 'head', // insert style tag inside of <head>
                                injectType: 'singletonStyleTag' // this is for wrap all your style in just one style tag
                            },
                        },
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.xml$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'xml', // specify the output directory
                            },
                        },
                    ],
                }
            ]

        },
        resolve: {
            extensions: [".js", ".jsx"],
        },
        devServer: {
            contentBase: path.resolve(__dirname, "src/"),
            compress: true,
            hot: true,
            host,
            port: 3000,
            publicPath: "/",
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: path.resolve(__dirname, "public/index.html"),
            }),
        ],
    };
};