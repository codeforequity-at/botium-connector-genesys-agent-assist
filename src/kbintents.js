const { getAuthToken, callApi } = require('./helpers.js')
const { Capabilities, Defaults } = require('./constants.js')
const _ = require('lodash')

const debug = require('debug')('botium-connector-genesys-agent-assist-intents')

/**
 *
 * @param caps
 * @param buildconvos
 * @param inboundMessageFlowName
 * @param botFlowId
 * @param clientId
 * @param clientSecret
 * @param language - in "en-us" format, or null for all
 * @returns {Promise<{utterances: *, convos: *}>}
 */
const importGenesysKbIntents = async ({ caps, buildconvos, knowledgeBaseId, clientId, clientSecret }) => {
  try {
    caps = Object.assign({}, Defaults, caps)

    const downloadResult = await _importIt({ caps, knowledgeBaseId, clientId, clientSecret })
    const utterances = Object.values(downloadResult.rawUtterances)
    const convos = []
    if (buildconvos) {
      for (const utterance of utterances) {
        const convo = {
          header: {
            name: utterance.name
          },
          conversation: [
            {
              sender: 'me',
              messageText: utterance.name
            },
            {
              sender: 'bot',
              asserters: [
                {
                  name: 'INTENT',
                  args: [utterance.name]
                }
              ]
            }
          ]
        }
        convos.push(convo)
      }
    }

    return {
      convos,
      utterances
    }
  } catch (err) {
    throw new Error(`Import failed: ${err.message}`)
  }
}

const _importIt = async ({ caps, knowledgeBaseId, clientId, clientSecret }) => {
  const token = await getAuthToken(
    caps[Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN],
    clientId || caps[Capabilities.GENESYS_AGENT_ASSIST_CLIENTID],
    clientSecret || caps[Capabilities.GENESYS_AGENT_ASSIST_CLIENTSECRET]
  )

  const utterances = {}
  const chatbotData = []

  knowledgeBaseId = knowledgeBaseId || caps[Capabilities.GENESYS_AGENT_ASSIST_KNOWLEDGE_ID]

  const reqOptionKnowledgeBase = {
    method: 'get',
    url: `/api/v2/knowledge/knowledgebases/${knowledgeBaseId}/documents`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  debug(`Request knowledge base: ${reqOptionKnowledgeBase.url}`)

  const apiDomain = caps[Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN]

  const responseKnowledgeBase = await callApi(
    token,
    apiDomain,
    reqOptionKnowledgeBase.url,
    reqOptionKnowledgeBase.method
  )

  let iteration = 1

  const getAllDocumentsRecursive = async (responseKnowledgeBase) => {
    debug(`total documents fetched[iteration ${iteration}]: ${responseKnowledgeBase.entities.length}`)

    for (const entity of responseKnowledgeBase.entities) {
      if (_.isArray(entity.alternatives)) {
        const intentName = entity.title
        for (const alternative of entity.alternatives) {
          const uttText = alternative.phrase
          if (!_.isEmpty(uttText)) {
            if (!utterances[intentName]) {
              utterances[intentName] = {
                name: intentName,
                utterances: [uttText]
              }
            } else {
              if (!utterances[intentName].utterances.includes(uttText)) {
                utterances[intentName].utterances.push(uttText)
              }
            }
          }
        }
      }
    }
    chatbotData.push(responseKnowledgeBase)

    if (responseKnowledgeBase.nextUri) {
      iteration++
      const reqOptionNextKnowledgeBase = {
        method: 'get',
        url: `${responseKnowledgeBase.nextUri}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      debug(`Request next knowledge base: ${reqOptionNextKnowledgeBase.url}`)
      const responseNextKnowledgeBase = await callApi(
        token,
        apiDomain,
        reqOptionNextKnowledgeBase.url,
        reqOptionNextKnowledgeBase.method
      )
      await getAllDocumentsRecursive(responseNextKnowledgeBase)
    }
  }

  await getAllDocumentsRecursive(responseKnowledgeBase)

  return { chatbotData: chatbotData.length > 1 ? chatbotData : chatbotData[0], rawUtterances: utterances }
}

module.exports = {
  importHandler: ({ caps, buildconvos, knowledgeBaseId, clientId, clientSecret, ...rest } = {}) => importGenesysKbIntents({
    caps,
    buildconvos,
    knowledgeBaseId,
    clientId,
    clientSecret,
    ...rest
  }),
  importArgs: {
    caps: {
      describe: 'Capabilities',
      type: 'json',
      skipCli: true
    },
    buildconvos: {
      describe: 'Build convo files for intent assertions (otherwise, just write utterances files)',
      type: 'boolean',
      default: false
    },
    knowledgeBaseId: {
      describe: 'Genesys Agent Assist Knowledge Id',
      type: 'string'
    },
    clientId: {
      describe: 'Client ID from Genesys OAuth integration',
      type: 'string'
    },
    clientSecret: {
      describe: 'Client Secret from Genesys OAuth integration',
      type: 'string'
    }
  }
}
