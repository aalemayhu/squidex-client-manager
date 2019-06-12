module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'airbnb'
  ],
  // add your custom rules here
  rules: {
    "no-console": "off",
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
