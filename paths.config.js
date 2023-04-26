module.exports = {
    root: './dist',
    html: {
        srcExt: 'twig',
        base: './src',
        main: './src/pages/**/*.twig',
        src: [
            './data/*.json',
            './src/pages/**/*.twig',
            './src/include/**/*.twig',
            './src/include/**/*.svg',
            './src/include/**/*.json',
        ],
        components: {
            pattern: './src/include/%s/%s.twig',
            replace: [
				[/^@/, '@atoms/'],
				[/^\^/, '^molecules/'],
				[/^&/, '&organisms/'],
            ],
        },
        svg: {
            pattern: './src/img/%s.svg',
        },
        data: './data',
        dest: './dist',
    },
    css: {
        srcExt: 'scss',
        main: './src/scss/[a-z]*.s[ac]ss',
        src: [
            './src/scss/**/*.s[ac]ss',
        ],
        components: {
            src: './src/include/**/*.s[ac]ss',
            base: './src',
            entryRelativePath: '../',
            sortFileName: '.sort',
            defaultSortPriority: 500,
        },
        dest: 'css',
    },
    js: {
        srcExt: 'js',
        main: './src/js/*.js',
        src: [
            './src/js/**/*.js',
            './src/include/**/*.js',
        ],
        components: {
            src: './src/include/**/*.js',
        },
        dest: './dist',
        webpackDestRoot: './dist',
    },
    copy: {
        img: ['src/img/**/*.*', 'dist/img/'],
        fonts: ['src/fonts/**/*.*', 'dist/fonts/'],
        public: ['src/public/**/*.*', 'dist/'],
    },
};
