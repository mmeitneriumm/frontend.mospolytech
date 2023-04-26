/* eslint-disable */

const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const NodeCache = require('node-cache');
const cache = new NodeCache();

const Twig = require('twig');

module.exports = (params) => {
    const pathsConfig = params.pathsConfig;
    const rootDir = params.rootDir;
    const pagesPath = path.join(rootDir, 'src/pages');
    const dataPath = path.join(rootDir, 'data');
    const includePath = path.join(rootDir, 'src/include');

    cache.flushAll();

    return (app, server) => {
        // Отключаем встроенное кеширование твига, будем кешировать страницы самостоятельно
        Twig.cache(false);

        Twig.extend((Twig) => {
            Twig.exports.extendTag(require('./viewTag')(Twig));
            Twig.exports.extendTag(require('./svgTag')(Twig));
        });

        // This section is optional and can be used to configure twig.

        const getPageData = (baseName) => {
            const jsonPath = path.join(rootDir, `${pathsConfig.html.data}/${baseName}.json`);
            const defaultJsonPath = path.join(rootDir, `${pathsConfig.html.data}/_.json`);

            let defaultData = {};
            let data = {
                page: baseName,
            };

            if (fs.existsSync(defaultJsonPath)) {
                defaultData = JSON.parse(fs.readFileSync(defaultJsonPath));
            }

            if (fs.existsSync(jsonPath)) {
                // noinspection JSCheckFunctionSignatures
                data = JSON.parse(fs.readFileSync(jsonPath));
            }

            return {...defaultData, ...data};
        };

        const showError = (res, status = '404', message = 'Not Found') => {
            res.send(`<h1>${status}</h1><hr><p>${message}</p>`);
        };

        const handlePage = (req, res) => {
            let page = req.params[0] || 'index';
            let pageFile = (page) => `${pagesPath}/${page}.twig`;

            if (!page || !fs.existsSync(pageFile(page))) {
                if (fs.existsSync(pageFile('404'))) {
                    page = '404';
                } else {
                    return showError(res);
                }
            }

            if (cache.has(page)) {
                console.log(`= ${page}: loading from cache`);
                return res.send(cache.get(page));
            }

            try {

                Twig.renderFile(
                    pageFile(page),
                    // TODO: возможно, есть более правильный способ передать настройки
                    {
                        "settings": {
                            "twig options": {
                                namespaces: {
                                    atoms: `${includePath}/@atoms`,
                                    molecules: `${includePath}/^molecules`,
                                    organisms: `${includePath}/&organisms`,
                                    layouts: `${includePath}/layout`,
                                }
                            }
                        },
                        ...getPageData(page),
                    },
                    (err, html) => {
                        if (err) {
                            return showError(res, 500, err);
                        } else {
                            console.log(`= ${page}: saving to cache`);
                            cache.set(page, html);
                            return res.send(html);
                        }
                    }
                );

            } catch (e) {
                return showError(res, 500, e);
            }

            return null;
        };

        app.get('/', handlePage);
        app.get('/(*).html', handlePage);

        app.use((err, req, res, next) => {
            console.error(err.stack);
            next(err);

            return null;
        });

        // Отслеживаем все изменения в twig файлах, чтобы перезагружать страницу
        chokidar
            .watch([
                `${rootDir}/src/**/*.twig`,
                `${rootDir}/src/**/*.json`,
                `${rootDir}/data/**/*.json`
            ], {
                alwaysStat: true,
                atomic: false,
                followSymlinks: false,
                ignoreInitial: true,
                ignorePermissionErrors: true,
                // ignored,
                // interval: typeof poll === 'number' ? poll : null,
                persistent: true,
                // usePolling: Boolean(poll)
            })
            .on('all', (event, path) => {
                let changedPage;

                const matches = path.match(new RegExp(`(${dataPath}/(.+).json|${pagesPath}/(.+).twig)`));

                if (matches) {
                    changedPage = matches[2] || matches[3];
                }

                if (changedPage) {

                    cache.del(changedPage);
                    console.log(`= ${changedPage}: flush cache`);

                } else {

                    console.log('= Flush all cache');
                    cache.flushAll();

                }

                console.log('= Reloading page');
                server.sockWrite(server.sockets, 'content-changed');
            });
    };
};
