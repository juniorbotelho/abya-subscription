const webpack = require("webpack");
const path = require("path");

const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

const terminalProgressBar = new cliProgress.SingleBar({
	format: "Progress |" + colors.green("{bar}") + "| {percentage}% || {value}/{total} Chunks",
	barCompleteChar: "\u2588",
	barIncompleteChar: "\u2591",
	hideCursor: true,
});

terminalProgressBar.start(100, 0);

function progressPlugin(percentage) {
	const currentPercentage = Math.abs(percentage * 100);

	if (currentPercentage <= 20) {
		console.clear();
	} else if (currentPercentage <= 100) {
		terminalProgressBar.update(currentPercentage);
	} else {
		terminalProgressBar.stop();
	}
}

const ProgressPlugin = new webpack.ProgressPlugin({
	activeModules: true,
	dependencies: true,
	modules: true,
	profile: true,
	handler: progressPlugin,
});

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
	entry: "./src/index.js",
	mode: "development",
	devtool: "source-map",
	devServer: {
		static: "dist",
		compress: true,
	},
	stats: "errors-only",
	plugins: [ProgressPlugin],
	output: {
		filename: "[name].[contenthash].js",
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	optimization: {
		moduleIds: "deterministic",
		runtimeChunk: "single",
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all",
				},
			},
		},
	},
};
