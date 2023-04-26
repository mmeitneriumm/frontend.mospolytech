const path = require('path');
const fs = require('fs');
const sprintf = require('sprintf-js').sprintf;

const __paths = require('../paths.config');
const includeTag = require('./includeTag');

/**
* Подключаем расширенный тег svg для подключения иконок
* (основан на include)
*/
module.exports = function svgTag(Twig) {
    return includeTag(Twig, {
        type: 'svg',
        regex: /^svg\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,

        prepareRenderData: (file, innerContext, state) => {
            file = sprintf(__paths.html.svg.pattern, file);
            if (!fs.existsSync(file)) return false;

            const filePath = path.join(__dirname, '../', file);
            const homePath = path.parse(state.template.path).dir;
            const relativePath = path.relative(homePath, filePath);

            return { file: relativePath };
        }
    });
}