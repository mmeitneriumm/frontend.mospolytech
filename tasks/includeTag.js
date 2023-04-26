/**
* Исходный код тега {% include %},
* расширен дополнительной обработкой пути файла и передаваемых данных
*
* @see Twig.logic.definitions
* @param Twig
* @param params
*/
module.exports =  function includeTag(Twig, params) {
    return {
        /**
         * Block logic tokens.
         *
         *  Format: {% includes "template.twig" [with {some: 'values'} only] %}
         */

        /* edited */
        type: params.type,
        regex: params.regex,
        /* end */

        next: [],
        open: true,
        compile(token) {
            const { match } = token;
            const expression = match[1].trim();

            /* edited */
            const ignoreMissing = true;
            /* end */

            const withContext = match[3];
            const only = ((match[4] !== undefined) && match[4].length);

            delete token.match;

            token.only = only;
            token.ignoreMissing = ignoreMissing;

            token.stack = Twig.expression.compile.call(this, {
                type: Twig.expression.type.expression,
                value: expression
            }).stack;

            if (withContext !== undefined) {
                token.withStack = Twig.expression.compile.call(this, {
                    type: Twig.expression.type.expression,
                    value: withContext.trim()
                }).stack;
            }

            return token;
        },
        parse(token, context, chain) {
            // Resolve filename
            let innerContext = token.only ? {} : { ...context };
            const { ignoreMissing } = token;
            const state = this;
            let promise = null;
            const result = { chain, output: '' };

            if (typeof token.withStack === 'undefined') {
                promise = Twig.Promise.resolve();
            } else {
                promise = Twig.expression.parseAsync.call(state, token.withStack, context)
                    .then(withContext => {
                        innerContext = {
                            ...innerContext,
                            ...withContext
                        };
                    });
            }

            return promise
                .then(() => {
                    return Twig.expression.parseAsync.call(state, token.stack, context);
                })
                .then(file => {
                    if (file instanceof Twig.Template) {
                        return file.renderAsync(
                            innerContext,
                            {
                                isInclude: true
                            }
                        );
                    }

                    try {
                        /*
                        Внедряем сюда кастомную логику: добавляем коллбэк,
                        который готовит путь к файлу и данные (получает их из JSON и т.д.)
                        */
                        params.prepareRenderData = params.prepareRenderData || false;
                        if (typeof params.prepareRenderData === 'function') {
                            const renderData = params.prepareRenderData(file, innerContext, state) || {};

                            file = renderData.hasOwnProperty('file') && renderData.file
                                ? renderData.file
                                : file;

                            innerContext = renderData.hasOwnProperty('innerContext')
                                ? renderData.innerContext
                                : innerContext;
                        }
                        /* end */

                        return state.template.importFile(file).renderAsync(
                            innerContext,
                            {
                                isInclude: true
                            }
                        );
                    } catch (error) {
                        console.log(error);
                        if (ignoreMissing) {
                            return '';
                        }

                        throw error;
                    }
                })
                .then(output => {
                    if (output !== '') {
                        result.output = output;
                    }

                    return result;
                });
        }
    };
}