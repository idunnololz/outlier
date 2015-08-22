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
            //module names are relative to baseUrl/paths config
            name: 'index'
        },
        {
            //module names are relative to baseUrl/paths config
            name: 'champions'
        }
    ]
})