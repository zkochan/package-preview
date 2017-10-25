module.exports = () => {
  try {
    require('is-negative')
    return false
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') return true
    return false
  }
}
