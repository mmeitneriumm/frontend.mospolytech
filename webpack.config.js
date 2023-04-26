/* eslint-disable */
const webpack = require('webpack');

const path = require('path');
const glob = require('glob');
const portFinderSync = require('portfinder-sync');

const __paths = require('./paths.config');
const isDevelopment = process.env.NODE_ENV === 'development';
const isStats = process.env.STATS === 'stats';
const isDebugging = process.env.DEBUG === 'debugging';
const isProduction = isStats ? isStats : !isDevelopment;
const isExpress = isDevelopment && process.env.TPL === 'express';
const isTwigLoader =
	!isExpress && (!isProduction || process.env.TPL !== 'none');
const distPath = path.join(__dirname, __paths.root);
const port = portFinderSync.getPort(3000);

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

let HtmlWebpackPlugin;
let ScriptExtHtmlWebpackPlugin;
let HtmlBeautifyPlugin;
if (isTwigLoader) {
	HtmlWebpackPlugin = require('html-webpack-plugin');
	ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
	HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
	// TODO: Watch adding twig files in src/pages
	// ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');
}

let BundleAnalyzerPlugin;
if (isStats) {
	BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
		.BundleAnalyzerPlugin;
}

const params = {
	rootDir: __dirname,
	pathsConfig: __paths,
	isDevelopment: isDevelopment,
	isStats: isStats,
	isProduction: isProduction,
	isExpress: isExpress,
	isTwigLoader: isTwigLoader,
	distPath: distPath,
	port: port,
};

console.log({
	isDevelopment: isDevelopment,
	isStats: isStats,
	isProduction: isProduction,
	isExpress: isExpress,
	isTwigLoader: isTwigLoader,
});

const config = {
	mode: isStats || isProduction ? 'production' : 'development',
	entry: () => {
		let entries = {};

		glob.sync(__paths.js.main).forEach((filePath) => {
			const name = path.parse(filePath).name;
			entries[name] = entries[name] || [];
			entries[name].push(path.resolve(__dirname, filePath));
		});

		// Для перезагрузки браузера при изменении twig
		if (isTwigLoader && isDevelopment) {
			glob.sync('*.twig', {
				matchBase: true,
				cwd: path.join(__dirname, './src/pages/'),
			}).forEach((twigFile) => {
				entries['index'].push(
					path.join(__dirname, './src/pages/', twigFile)
				);
			});
		}

		glob.sync(__paths.css.main).forEach((filePath) => {
			const name = path.parse(filePath).name;
			entries[name] = entries[name] || [];
			entries[name].push(path.resolve(__dirname, filePath));
		});

		// Получаем стили компонентов
		entries.components = require('./tasks/getComponentsStyle')();

		// Js компонентов
		glob.sync(__paths.js.components.src).forEach((filePath) => {
			entries.components.push(path.resolve(__dirname, filePath));
		});

		return entries;
	},

	output: {
		filename: 'js/[name].js',
		chunkFilename: 'js/[name].chunk.js',
		path: distPath,
	},

	watch: isDevelopment && !isDebugging,

	watchOptions: {
		aggregateTimeout: 300,
	},

	devtool: isProduction ? false : 'eval-source-map',

	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules\/(?!(swiper|dom7|micromodal|sticky-sidebar)\/).*|bower_components)/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
							plugins: [
								require('@babel/plugin-proposal-object-rest-spread'),
								require('@babel/plugin-transform-object-assign'),
							],
						},
					},
				],
			},
			{
				test: /\.s[ac]ss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: isDevelopment,
						},
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							config: {
								path: path.join(__dirname, '/'),
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						// Переменные и миксины назначаем глобальными во всем проекте
						loader: 'sass-resources-loader',
						options: {
							resources: [
								'./src/scss/vars/index.scss',
								'./src/scss/mixins/index.scss',
							],
						},
					},
				],
			},
			{
				test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[path][name].[ext]',
							context: 'src/',
							publicPath: '../',
						},
					},
				],
			},
			!isTwigLoader
				? {}
				: {
						test: /\.twig$/,
						use: [
							'raw-loader',
							{
								loader: 'twig-html-loader',
								options: {
									data: require('./tasks/readData')(
										isDevelopment,
										__dirname
									),
									extend: (Twig) => {
										Twig.exports.extendTag(
											require('./tasks/viewTag')(Twig)
										);
										Twig.exports.extendTag(
											require('./tasks/svgTag')(Twig)
										);
									},
									namespaces: {
										layouts: './src/include/layout',
										atoms: './src/include/@atoms',
										molecules: './src/include/^molecules',
										organisms: './src/include/&organisms',
									},
								},
							},
						],
				  },
		],
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/[name].css',
			chunkFilename: 'css/[name].chunk.css',
		}),
		...(!isTwigLoader
			? []
			: glob
					.sync('*.twig', {
						matchBase: true,
						cwd: path.join(__dirname, './src/pages/'),
					})
					.map((twigFile) => {
						const twigFileObj = path.parse(twigFile);
						return new HtmlWebpackPlugin({
							filename: path.join(
								twigFileObj.dir,
								twigFileObj.name + '.html'
							),
							template: path.join(
								__dirname,
								'./src/pages',
								twigFile
							),

							// Несовместимо с серверным рендерингом страниц
							inject: false,

							// Если страница index и находится в вложенных папках то не встраиваем bundle js и css
							// inject: (() => {
							//     if (twigFileObj.dir == '') {
							//         if (twigFileObj.name == 'index') {
							//             return 'head';
							//         } else {
							//             return true;
							//         }
							//     } else {
							//         return false;
							//     }
							// })(),

							// chunks: [
							//     'vendors',
							//     'index',
							//     'components'
							// ],
							// chunksSortMode: 'manual'
						});
					})),
		// Добавляем к подключаемым скриптам defer
		...(!isTwigLoader
			? []
			: [new ScriptExtHtmlWebpackPlugin({ defaultAttribute: 'defer' })]),
		new CleanWebpackPlugin(), // Удаляем папку dist
		new CopyPlugin([
			{
				from: 'src/public/',
				toType: 'dir',
			}, // Перемещам содержимое public в dist
			{
				from: 'src/img/',
				to: 'img',
			}, // Перемещаем содержимое img в dist/img
		]),
		...(isTwigLoader ? [new HtmlBeautifyPlugin()] : []), // Форматирование HTML страниц
		...(isStats ? [new BundleAnalyzerPlugin()] : []), // Анализ bundls
		new webpack.ProvidePlugin({
			$: 'jquery',
		}),

		// TODO: Watch adding twig files in src/pages
		// new ExtraWatchWebpackPlugin({
		//     dirs: ['src/pages']
		// }
	],

	optimization: {
		minimize: isProduction,
		minimizer: isProduction
			? [new TerserPlugin(), new OptimizeCssAssetsPlugin()]
			: [],
		splitChunks: {
			chunks(chunk) {
				return chunk.name !== 'components';
			},
		},
	},

	stats: {
		all: false,
		modules: false,
		errors: true,
		entrypoints: false,
		children: false,
	},

	devServer: {
		// contentBase: [path.join(__dirname, 'src/pages')],
		// watchContentBase: true,
		historyApiFallback: true,
		host: '0.0.0.0',
		port: port,
		// compress: true,         // Включение gzip
		open: false, // Открыть браузер после запуска
		hot: true,
		inline: true,
		overlay: {
			// Вывод ошибок и предупреждений сборки в HTML
			warnings: true,
			errors: true,
		},
		public: `localhost:${port}`,

		...(!isExpress
			? {}
			: { before: require('./tasks/twigServer')(params) }),
	},
};

module.exports = config;
