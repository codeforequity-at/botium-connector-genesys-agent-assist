const BotiumConnectorGenesysAgentAssist = require('./src/connector')
// const { importHandler, importArgs } = require('./src/intents')
// const { exportHandler, exportArgs } = require('./src/intents')
const fs = require('fs')
const path = require('path')

const logo = fs.readFileSync(path.join(__dirname, 'logo.png')).toString('base64')

module.exports = {
  PluginVersion: 1,
  PluginClass: BotiumConnectorGenesysAgentAssist,
  // Import: {
  //   Handler: importHandler,
  //   Args: importArgs
  // },
  // Export: {
  //   Handler: exportHandler,
  //   Args: exportArgs
  // },
  PluginDesc: {
    name: 'Genesys Cloud Agent Assist Testing',
    avatar: logo,
    provider: 'Genesys Cloud',
    features: {
      intentResolution: true,
      intentConfidenceScore: true,
      alternateIntents: false,
      entityResolution: false,
      entityConfidenceScore: false,
      testCaseGeneration: false,
      testCaseExport: false
    },
    capabilities: [
      {
        name: 'GENESYS_AGENT_ASSIST_API_REGION',
        label: 'Api Host',
        description: 'Genesys Agent Assist Api Host',
        type: 'string',
        required: false

      },
      {
        name: 'GENESYS_AGENT_ASSIST_CLIENTID',
        label: 'Oauth Client ID',
        description: 'Genesys Agent Assist Oauth Client ID',
        type: 'string',
        required: true
      },
      {
        name: 'GENESYS_AGENT_ASSIST_CLIENTSECRET',
        label: 'Oauth Client Secret',
        description: 'Genesys Agent Assist Oauth Client Secret',
        type: 'secret',
        required: true
      },
      {
        name: 'GENESYS_AGENT_ASSIST_KNOWLEDGE_ID',
        label: 'Knowledge Id',
        description: 'Genesys Agent Assist Knowledge Id',
        type: 'string',
        required: true
      },
      {
        name: 'GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS',
        label: 'Include Draft Docs',
        description: 'Genesys Agent Assist Include Draft Docs while querying documents',
        type: 'boolean',
        required: false
      },
      {
        name: 'GENESYS_AGENT_ASSIST_TIMEOUT',
        label: 'Timeout',
        description: 'Genesys Agent Assist Query Timeout',
        type: 'int',
        advanced: true,
        required: false
      }
    ]
  }
}
