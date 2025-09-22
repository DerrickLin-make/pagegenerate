const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/v1',
    createProxyMiddleware({
      target: 'https://api.dify.ai',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/v1': '/v1'
      },
      logLevel: 'warn',
      timeout: 10 * 60 * 1000,
      proxyTimeout: 10 * 60 * 1000
    })
  );
};
