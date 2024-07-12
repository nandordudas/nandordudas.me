export default defineNitroPlugin((nitroApp) => {
  // console.log('Nitro plugin')

  nitroApp.hooks.hook('content:file:beforeParse', (file) => {
    // console.log('content:file:beforeParse', file)
  })
})
