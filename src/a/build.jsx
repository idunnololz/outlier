({
    appDir: '..',
    baseUrl: './js',
    mainConfigFile: 'config.js',
    dir: '../../www-built',
    fileExclusionRegExp: /^\..*|^a$/,
    optimizeCss: 'standard',
    removeCombined: true,
    modules: [
        {
            name: 'index'
        },
        {
            name: 'champions'
        }
    ]
})