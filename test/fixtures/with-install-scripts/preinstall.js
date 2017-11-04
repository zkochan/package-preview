'use strict'
const fs = require('fs')

fs.writeFileSync('createdByPreInstallScript.js', 'module.exports=true', 'utf8')
