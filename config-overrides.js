module.exports = function override(config, env) {
    const okv = {
        fallback: {
            url: require.resolve('url-shim'),
        },
    };

    if (!config.resolve) {
        config.resolve = okv;
    } else {
        config.resolve.fallback = { ...config.resolve.fallback, ...okv.fallback };
    }

    return config;
}