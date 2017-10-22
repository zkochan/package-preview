'use strict'
const packagePreview = require('./lib').default

packagePreview('.', '.')
  .then(() => console.log('Done'))
  .catch(console.error.bind(console))
