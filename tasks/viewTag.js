const path = require('path');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;

const __paths = require('../paths.config');
const includeTag = require('./includeTag');

module.exports =  function viewTag(Twig) {
    return includeTag(Twig, {
        type: 'view',
        regex: /^view\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,

        prepareRenderData: (file, innerContext, state) => {
            let componentName = file;
            let templatePath;
            let componentDefaultData = {};
            let relativePath = null;

            __paths.html.components.replace.forEach((replace) => {
                // подменяем ключевые символы на пути до специальных папок
                file = file.replace(replace[0], replace[1]);

                // очищаем путь к файлу от ключевых символов
                componentName = componentName.replace(replace[0], '');
            });

            // Берем название компонента и подставляем его в путь из настроек
            templatePath = sprintf(__paths.html.components.pattern, file, componentName);

            if (!fs.existsSync(templatePath)) {
                templatePath = sprintf(__paths.html.components.pattern, file, 'index');
            }

            if (!fs.existsSync(templatePath)) {
                templatePath = false;
            } else {
                // В пути к файлу заменяем расширение .twig на .json
                // Получаем из этого файла данные
                const dataFile = templatePath.replace(new RegExp(`.${__paths.html.srcExt}$`), '.json');
                if (fs.existsSync(dataFile)) {
                    // noinspection JSCheckFunctionSignatures
                    componentDefaultData = JSON.parse(fs.readFileSync(dataFile));
                }

                // Расширяем объект данными, полученными из файла.
                // Важно, что эти данные передаем в начале, так как их приоритет ниже
                innerContext = Object.assign(
                    {},
                    componentDefaultData,
                    innerContext
                );

                const filePath = path.join(__dirname, '../', templatePath);
                const homePath = path.parse(state.template.path).dir;
                relativePath = path.relative(homePath, filePath);
            }

            return {
                file: relativePath,
                innerContext: innerContext
            };
        }
    });
}