# Botium Connector for Genesys Agent Assist

This is a Botium connector for testing your Genesys Agent Assist query resolution logic.

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

## Prerequisites

* __Node.js and NPM__
* [Genesys PureCloud ClientId and ClientSecret](https://help.mypurecloud.com/articles/create-an-oauth-client/)
* KnowledgeId
* The deployment name
* A __project directory__ on your workstation to hold test cases and Botium configuration

See also [Understand knowledge base V2 questions and answer articles](https://help.mypurecloud.com/articles/understand-knowledge-base-v2-questions-and-answer-articles/)

## Install Botium and Genesys Agent Assist Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-genesys-agent-assist
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-genesys-agent-assist
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

_Already integrated into Botium Box, no setup required_

## Connecting Genesys Knowledge Base

Create a botium.json with Genesys ClientId, ClientSecret and KnowledgeId:

```javascript
{
  "botium": {
    "Capabilities": {
      "PROJECTNAME": "genesys-kb-connector",
      "CONTAINERMODE": "genesys-agent-assist",
      "GENESYS_AGENT_ASSIST_API_REGION": "mypurecloud",
      "GENESYS_AGENT_ASSIST_CLIENTID": "xxx",
      "GENESYS_AGENT_ASSIST_CLIENTSECRET": "xxx",
      "GENESYS_AGENT_ASSIST_KNOWLEDGE_ID": "xxx",
      "GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS": true,
      "GENESYS_AGENT_ASSIST_TIMEOUT": 60000
    }
  }
}
```

Botium setup is ready, you can begin to write your [BotiumScript](https://github.com/codeforequity-at/botium-core/wiki/Botium-Scripting) files.

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __genesys-agent-assist__ to activate this connector.

### GENESYS_AGENT_ASSIST_API_REGION
See [Genesys Cloud environment region] (https://developer.genesys.cloud/platform/api/)
default: mypurecloud(us-east-1)

### GENESYS_AGENT_ASSIST_CLIENTID
See [Genesys PureCloud ClientId and ClientSecret](https://help.mypurecloud.com/articles/create-an-oauth-client/)

### GENESYS_AGENT_ASSIST_CLIENTSECRET
See [Genesys PureCloud ClientId and ClientSecret](https://help.mypurecloud.com/articles/create-an-oauth-client/)

### GENESYS_AGENT_ASSIST_KNOWLEDGE_ID
The Id of Knowlege Base to which Agent assist is conected to (https://help.mypurecloud.com/articles/create-genesys-agent-assist-as-an-assistant/)

### GENESYS_AGENT_ASSIST_INCLUDE_DRAFTDOCS
Indicates whether the search results would also include draft documents.
default: true

### GENESYS_AGENT_ASSIST_TIMEOUT
API Timeout
default: 10000 ms

See also [About the knowledge workbench V2](https://help.mypurecloud.com/articles/about-the-knowledge-workbench-v2/)




