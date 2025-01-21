const debug = require('debug')('botium-connector-genesys-agent-assist')

/**
 * Method to fetch an authentication token
 * @returns {Promise<string>} - The authentication token
 */
const getAuthToken = async (domain, clientId, clientSecret) => {
  try {
    const authUrl = `https://login.${domain}/oauth/token`
    debug('auth token url:', authUrl)
    const encryptedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    // Encode the body as x-www-form-urlencoded
    const body = new URLSearchParams({
      grant_type: 'client_credentials'
    })

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encryptedCredentials}`
      },
      body: body.toString() // Convert to string for x-www-form-urlencoded
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    return data.access_token
  } catch (error) {
    debug('Error fetching auth token:', error)
    throw new Error(`Error fetching auth token: ${error.message}`)
  }
}

/**
 * Method to make a generic API call
 * @param {string} endpoint - The API endpoint
 * @param {string} method - HTTP method (GET or POST)
 * @param {object} body - The request body for POST requests
 * @param {number} timeout - The request timeout in milliseconds
 * @param {object} headers - Additional headers to include
 * @returns {Promise<object>} - The API response
 */
const callApi = async (token, domain, endpoint, method = 'GET', body = null, timeout = 10000, headers = {}) => {
  try {
    const fetchOptions = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    if (method === 'POST' && body) {
      fetchOptions.body = JSON.stringify(body)
    }

    debug('ap url:', `https://api.${domain}${endpoint}`)

    const response = await fetch(`https://api.${domain}${endpoint}`, { ...fetchOptions, signal: AbortSignal.timeout(timeout) })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      debug('Error: Request timed out')
    } else {
      debug('Error making API call:', error)
    }
    throw new Error(`Error making API call: ${error.message}`)
  }
}

const extractResponseText = (data) => {
  const result = data.results[0] // Access the first result
  if (result && result.document && result.document.variations) {
    const variation = result.document.variations[0] // Access the first variation
    if (variation && variation.body && variation.body.blocks) {
      const paragraph = variation.body.blocks[0].paragraph
      if (paragraph && paragraph.blocks) {
        const textBlock = paragraph.blocks[0]
        if (textBlock && textBlock.text) {
          return textBlock.text.text // Extract the text value
        }
      }
    }
  }
  return null // Return null if the text is not found
}

module.exports = {
  getAuthToken,
  callApi,
  extractResponseText
}
