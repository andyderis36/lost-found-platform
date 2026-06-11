const nextConfig = require('eslint-config-next');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = [
  ...nextConfig,
  {
    plugins: {
      'react-hooks': reactHooksPlugin
    },
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
