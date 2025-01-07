require('dotenv').config()
const assert = require('chai').assert
const BotiumConnector = require('../../src/connector')
const { readCaps } = require('./helper')

describe('connector', function () {
  beforeEach(async function () {
    this.caps = readCaps()
    this.botMsgPromise = new Promise(resolve => {
      this.botMsgPromiseResolve = resolve
    })
    const queueBotSays = (botMsg) => {
      this.botMsgPromiseResolve(botMsg)
    }
    this.connector = new BotiumConnector({ queueBotSays, caps: this.caps })
    await this.connector.Validate()
    await this.connector.Build()
    await this.connector.Start()
  })

  it('should successfully get an answer for user query', async function () {
    await this.connector.UserSays({ messageText: 'call cost' })
    const botMsg = await this.botMsgPromise
    assert.equal(botMsg?.nlp?.intent?.name, 'Cyara Call Costs - Everything One Needs To Know')
  }).timeout(10000)

  it('confidence score should be above 90 for answer of user query', async function () {
    await this.connector.UserSays({ messageText: 'call cost' })
    const botMsg = await this.botMsgPromise
    assert.isAbove(botMsg?.nlp?.intent?.confidence*100, 90)
  }).timeout(10000)

  afterEach(async function () {
    await this.connector.Stop()
  })
})
