/* eslint-disable */
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const __paths = require('../paths.config');

module.exports = function () {
    const sortableStyles = [];
    const entries = [];

    glob.sync(__paths.css.components.src).forEach(filePath => {
        // Название файла в котором указано значение сортировки
        const sortFileName = __paths.css.components.sortFileName;
        const pathObj = path.parse(filePath);
        const sortPath = path.join(pathObj.dir, sortFileName);

        let usuallyPriority = true;

        // Если существует файл
        if (fs.existsSync(sortPath)) {
            try {
                // Попытаемся прочитать файл
                const readData = fs.readFileSync(sortPath, 'utf8');
                const number = Number(readData);

                if (isNaN(number)) {
                    console.log('\n\nERROR convert sort style\n\n');
                } else if (number != __paths.css.components.defaultSortPriority) {  // Если приоритет не равен default значению
                    usuallyPriority = false;
                    sortableStyles.push({
                        path: filePath,
                        priority: number
                    });
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (usuallyPriority) {
            entries.push(filePath);
        }
    });

    // Если есть сортируемые стили
    if (sortableStyles.length) {
        const defaultPriority = __paths.css.components.defaultSortPriority;

        // Сортируем выше чем Default по возрастанию, ниже чем Default по убыванию (600, 700, 701, 500-Default, 499, 300, 1)
        sortableStyles.sort((a, b) => {
            if ((b.priority > defaultPriority && a.priority < defaultPriority)
                || (b.priority < defaultPriority && a.priority < defaultPriority))
                return b.priority - a.priority
            else if (b.priority > defaultPriority && a.priority > defaultPriority)
                return a.priority - b.priority;
            else return b.priority - a.priority
        });


        sortableStyles.forEach(file => {
            // Выше чем Default вставляем в начало массива
            if (file.priority > defaultPriority) entries.unshift(file.path);
            // Ниже чем Default вставляем в конец массива
            else entries.push(file.path);
        });
    }

    return entries;
}