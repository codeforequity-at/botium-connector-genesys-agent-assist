const debug = require('debug')('botium-connector-genesys-agent-assist')

/**
 * Method to fetch an authentication token
 * @returns {Promise<string>} - The authentication token
 */
const getAuthToken = async (region, clientId, clientSecret) => {
  try {
    debug('auth token url:', `https://login.${region}.com/oauth/token`)
    const encryptedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    // Encode the body as x-www-form-urlencoded
    const body = new URLSearchParams({
      grant_type: 'client_credentials'
    })

    const response = await fetch(`https://login.${region}.com/oauth/token`, {
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
    console.error('Error fetching auth token:', error)
    throw error
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
const callApi = async (token, region, endpoint, method = 'GET', body = null, timeout = 10000, headers = {}) => {
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

    debug('ap url:', `https://api.${region}.com/${endpoint}`)

    const response = await fetch(`https://api.${region}.com/${endpoint}`, { ...fetchOptions, signal: AbortSignal.timeout(timeout) })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out')
    } else {
      console.error('Error making API call:', error)
    }
    throw error
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
