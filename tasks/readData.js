/* eslint-disable */
const path = require('path');
const fs = require('fs');

const __paths = require('../paths.config');
const watchComponentsJson = require('./watchComponents');

module.exports = function (isDevelopment, rootPath) {
    return function (context) {
        // context - файл который включен в плагин html-webpack-plugin

        // context - файл который включен в плагин html-webpack-plugin
        let baseName;

        const pagesPath = path.join(rootPath, 'src/pages');
        const baseNameMatch = context
            .resourcePath
            .match(new RegExp(`${pagesPath}/(.+)${path.extname(context.resourcePath)}\$`));

        if (baseNameMatch && baseNameMatch[1]) {
            baseName = baseNameMatch[1]
        } else {
            baseName = path
                .basename(context.resourcePath)
                .replace(new RegExp(`${path.extname(context.resourcePath)}\$`), '');
        }

        const jsonPath = `${__paths.html.data}/${baseName}.json`;
        const defaultJsonPath = `./data/_.json`;

        let defaultData = {};
        let data = {};

        if (fs.existsSync(defaultJsonPath)) {
            defaultData = JSON.parse(fs.readFileSync(defaultJsonPath));
        }

        if (fs.existsSync(jsonPath)) {
            // noinspection JSCheckFunctionSignatures
            data = JSON.parse(fs.readFileSync(jsonPath));
        }

        if (isDevelopment) {
            // Слежка за [name].json файлом
            context.addDependency(path.join(__dirname, '../', jsonPath));
            // Слежка за _.json
            context.addDependency(path.resolve(__dirname, '../', defaultJsonPath));
            // Слежка за файлами json у компонентов
            watchComponentsJson(context);
        }

        return { ...defaultData, ...data };
    };
};
