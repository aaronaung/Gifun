/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

// note we do use https://www.gatsbyjs.org/packages/gatsby-plugin-create-client-paths/
// for more info read https://www.gatsbyjs.org/docs/authentication-tutorial/#creating-client-only-routes
const path = require('path')

exports.onCreateWebpackConfig = ({ actions, getConfig, stage }) => {
    const config = getConfig()

    const coreJs2config = config.resolve.alias['core-js']
    delete config.resolve.alias['core-js']
    config.resolve.alias[`core-js/modules`] = `${coreJs2config}/modules`
    try {
        config.resolve.alias[`core-js/es`] = path.dirname(require.resolve('core-js/es'))
    } catch (err) {}
    actions.replaceWebpackConfig(config)
}
