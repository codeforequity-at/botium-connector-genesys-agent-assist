const { getAuthToken, callApi, extractResponseText } = require('./helpers.js')
const BotErrorMessage = require('./error-message.js')
const debug = require('debug')('botium-connector-genesys-agent-assist')

const Capabilities = {
  GENESYS_AGENT_ASSIST_API_DOMAIN: 'GENESYS_AGENT_ASSIST_API_DOMAIN',
  GENESYS_AGENT_ASSIST_CLIENTID: 'GENESYS_AGENT_ASSIST_CLIENTID',
  GENESYS_AGENT_ASSIST_CLIENTSECRET: 'GENESYS_AGENT_ASSIST_CLIENTSECRET',
  GENESYS_AGENT_ASSIST_KNOWLEDGE_ID: 'GENESYS_AGENT_ASSIST_KNOWLEDGE_ID',
  GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS: 'GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS',
  GENESYS_AGENT_ASSIST_TIMEOUT: 'GENESYS_AGENT_ASSIST_TIMEOUT'
}

const Defaults = {
  [Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN]: 'mypurecloud.com',
  [Capabilities.GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS]: true,
  [Capabilities.GENESYS_AGENT_ASSIST_TIMEOUT]: 10000
}

class BotiumConnectorGenesysAgentAssist {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = caps
  }

  async Validate () {
    debug('Validate called')
    this.caps = Object.assign({}, Defaults, this.caps)

    if (!this.caps[Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN]) throw new Error('GENESYS_AGENT_ASSIST_API_DOMAIN capability required')
    if (!this.caps[Capabilities.GENESYS_AGENT_ASSIST_CLIENTID]) throw new Error('GENESYS_AGENT_ASSIST_CLIENTID capability required')
    if (!this.caps[Capabilities.GENESYS_AGENT_ASSIST_CLIENTSECRET]) throw new Error('GENESYS_AGENT_ASSIST_CLIENTSECRET capability required')
    if (!this.caps[Capabilities.GENESYS_AGENT_ASSIST_KNOWLEDGE_ID]) throw new Error('GENESYS_AGENT_ASSIST_KNOWLEDGE_ID capability required')
    if (!this.caps[Capabilities.GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS]) throw new Error('GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS capability required')
    if (!this.caps[Capabilities.GENESYS_AGENT_ASSIST_TIMEOUT]) throw new Error('GENESYS_AGENT_ASSIST_TIMEOUT capability required')
  }

  Build () {
    debug('Build called')
  }

  async Start () {
    debug('Start called')
    try {
      this.token = await getAuthToken(
        this.caps[Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN],
        this.caps[Capabilities.GENESYS_AGENT_ASSIST_CLIENTID],
        this.caps[Capabilities.GENESYS_AGENT_ASSIST_CLIENTSECRET])

      debug('----------Validation Phase----------')
      debug('Genesys API domain:', this.caps[Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN])
      debug('Genesys Token:', this.token)
      debug('Genesys Knowledge Id:', this.caps[Capabilities.GENESYS_AGENT_ASSIST_KNOWLEDGE_ID])
      debug('')
    } catch (e) {
      throw new Error(`Error fetching Genesys token: ${e.message}`)
    }
  }

  async UserSays (msg) {
    debug('UserSays called')
    if (!this.token) throw new Error('no token')

    if (msg.messageText.length < 3) throw new Error(BotErrorMessage.INVALID_MESSAGE)

    const getInputPayload = () => {
      return {
        query: msg.messageText,
        pageSize: 1,
        pageNumber: 1,
        includeDraftDocuments: this.caps[Capabilities.GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS],
        includeVariations: 'SingleMostRelevant'
      }
    }

    try {
      const inputPayload = getInputPayload()
      msg.sourceData = inputPayload
      debug(`Genesys agent-assist request: ${JSON.stringify(inputPayload, null, 2)}`)
      const knowledgeId = this.caps[Capabilities.GENESYS_AGENT_ASSIST_KNOWLEDGE_ID]
      debug(`knowledgeId: ${knowledgeId}`)

      const sendMessageResponse = await callApi(this.token,
        this.caps[Capabilities.GENESYS_AGENT_ASSIST_API_DOMAIN],
                `api/v2/knowledge/knowledgebases/${knowledgeId}/documents/search?expand=documentVariations`,
                'POST',
                inputPayload,
                this.caps[Capabilities.GENESYS_AGENT_ASSIST_TIMEOUT])

      debug('Genesys agent-assist response')
      debug(sendMessageResponse)

      await this._processGenesysAssistResponse(sendMessageResponse)
    } catch (err) {
      throw new Error(`Cannot send message to Genesys Agent Assist container: ${err.message}`)
    }
  }

  async _processGenesysAssistResponse (sendMessageResponse) {
    debug('processGenesysAssistResponse called')

    const nlp = {
      intent: {},
      entities: []
    }

    if (sendMessageResponse && sendMessageResponse.results && sendMessageResponse.results.length > 0) {
      nlp.intent = {
        name: sendMessageResponse.results[0].document.title,
        confidence: sendMessageResponse.results[0].confidence,
        intents: []
      }
    }

    debug(nlp)

    const sendBotMsg = (botMsg) => {
      setTimeout(() => this.queueBotSays(Object.assign({}, { sender: 'bot', sourceData: sendMessageResponse, nlp }, botMsg)), 0)
    }

    const messageText = extractResponseText(sendMessageResponse)

    if (!messageText) {
      sendBotMsg({ messageText: BotErrorMessage.INVALID_QUERY })
      return
    }

    sendBotMsg({ messageText })
  }

  Stop () {
    debug('Stop called')
    this.token = null
  }

  Clean () {
    debug('Clean called')
  }
}

module.exports = BotiumConnectorGenesysAgentAssist
