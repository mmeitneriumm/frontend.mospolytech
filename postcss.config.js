const isProd = process.env.NODE_ENV !== 'development';

const presetEnv = require('postcss-preset-env')({
    autoprefixer: {
        cascade: true,
        grid: true,
        flexbox: true,
    },
    minimize: isProd
});

module.exports = ({file, options, env}) => {
    let plugins = [];

    // plugins.push(require('autoprefixer')({
    //     cascade: true
    // }));

    plugins.push(presetEnv);

    // !isProd || plugins.push(require('cssnano')());

    return {
        plugins: plugins,
        sourceMap: true,
    };
};
