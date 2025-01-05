import { NodeMap, FlumeNode } from "./types";




export function buildNodeToCode(rawNodes: NodeMap) {
  // console.log({ nodes: rawNodes })
  const triggerNode = [];
  for (const key in rawNodes) {
    const node = rawNodes[key]
    if (node.type == "triggerOnMessageSend") {
      triggerNode.push(node)
    }
  }
  const clientVariableName = `client_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
  const template = `import { Client, Events, GatewayIntentBits } from "discord.js";

  const ${clientVariableName} = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });

  ${clientVariableName}.on("ready", async (client) => {
    console.log("Bot is ready");
  });
  \n`
  const globalVariable = {
    client: clientVariableName,
  } as Record<string, string>
  let result = template
  for (const n of triggerNode) {
    const variable = { ...globalVariable } as Record<string, string>
    for (const i in n.connections.outputs) {
      variable[`${n.id}_${i}`] = `${replaceSpecialChar(n.id)}_${i}_result`
    }
    if (n.type == "triggerOnMessageSend") {
      result += `client.on("messageCreate",async function(${replaceSpecialChar(n.id)}_eventMessageSendData_result){\n
        ${n.inputData.skipBot.checkbox ? `if(${replaceSpecialChar(n.id)}_eventMessageSendData_result.author.bot) return;\n` : ""}
        ${parseNode(n, rawNodes, variable)}});\n
      `
    }
  }
  return result + `\nclient.login(process.env.DISCORD_BOT_TOKEN);`
}

function parseNode(node: FlumeNode, rawNodesList: NodeMap, variable: Record<string, string>) {
  let result = ";"
  console.log({ node, variable })
  const nodeTriggerAfter = node.connections.outputs["trigger"]
  switch (node.type) {
    case "triggerOnMessageSend": break
    case "getMessageContent":
      {
        const tmp = node.connections.inputs["eventMessageSendData"]
        if (!tmp) break
        const messagePort = tmp[0]
        const variableName = variable[messagePort.nodeId + "_" + messagePort.portName]
        if (!variableName) throw new Error("Variable Not Found")
        result += `const ${replaceSpecialChar(node.id)}_messageContent_result = ${variableName}.content;\n`
        variable[`${node.id}_messageContent`] = `${replaceSpecialChar(node.id)}_messageContent_result`
        break
      }
    case "compareStringNode": {
      let data1 = `\`${node.inputData.data1.text}\``
      let data2 = `\`${node.inputData.data2.text}\``
      for (const port in node.connections.inputs) {
        if (port == "data1") {
          const nodeInfo = (node.connections.inputs[port][0])
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          data1 = variableName
        } else if (port == "data2") {
          const nodeInfo = (node.connections.inputs[port][0])
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          data2 = variableName
        }
      }
      const compareType = node.inputData.compareType.select
      if (compareType == "equal") {
        result += `const ${replaceSpecialChar(node.id)}_result_result = ${data1} == ${data2};\n`
      } else if (compareType == "startsWith") {
        result += `const ${replaceSpecialChar(node.id)}_result_result = ${data1}.startsWith(${data2});\n`
      }
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "reverseTrueFalse": {
      const nodeInfo = node.connections.inputs["value"] ? (node.connections.inputs["value"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      result += `const ${replaceSpecialChar(node.id)}_result_result = !${variableName};\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "if": {
      const nodeInfo = node.connections.inputs["value"] ? (node.connections.inputs["value"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo?.nodeId + "_" + nodeInfo?.portName]
      if (!variableName) throw new Error("Variable Not Found")
      const trueTrigger = node.connections.outputs["trueTrigger"] ? node.connections.outputs["trueTrigger"][0] : null
      const falseTrigger = node.connections.outputs["falseTrigger"] ? node.connections.outputs["falseTrigger"][0] : null
      result += `if(${variableName}){\n${trueTrigger ? parseNode(rawNodesList[trueTrigger.nodeId], rawNodesList, variable) : ""}\n} else {\n${falseTrigger ? parseNode(rawNodesList[falseTrigger.nodeId], rawNodesList, variable) : ""}\n};\n`
      break
    }
    case "sendMessage": {
      const nodeInfo = node.connections.inputs["eventMessageSendData"] ? (node.connections.inputs["eventMessageSendData"][0]) : null
      if (!nodeInfo) break
      const messageVariableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!messageVariableName) throw new Error("Variable Not Found")
      let content = node.inputData.content.text
      if (node.connections.inputs["content"]) {
        const nodeInfo = node.connections.inputs["content"] ? (node.connections.inputs["content"][0]) : null
        if (nodeInfo) {
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          content = variableName
        }
      }
      result += `const ${replaceSpecialChar(node.id)}_eventMessageSendData_result = await ${messageVariableName}.reply(\`${content}\`);\n`
      variable[`${node.id}_eventMessageSendData`] = `${replaceSpecialChar(node.id)}_eventMessageSendData_result`
      break
    }
    case "extractMessageEvent": {
      const nodeInfo = node.connections.inputs["eventMessageSendData"] ? (node.connections.inputs["eventMessageSendData"][0]) : null
      if (!nodeInfo) break
      const messageVariableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!messageVariableName) throw new Error("Variable Not Found")
      for (const port of ["author", "content", "channel", "guild", "member", "id"]) {
        if (port == "trigger") continue
        result += `const ${replaceSpecialChar(`${node.id}_${port}_result`)} = ${messageVariableName}.${port};\n`
        variable[`${node.id}_${port}`] = `${replaceSpecialChar(`${node.id}_${port}_result`)}`
      }
      break
    }
    case "splitString": {
      const nodeInfo = node.connections.inputs["string"] ? (node.connections.inputs["string"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      const separator = node.inputData.separator.text
      result += `const ${replaceSpecialChar(node.id)}_result_result = ${variableName}.split(\`${separator}\`);\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "forEach": {
      const nodeInfo = node.connections.inputs["array"] ? (node.connections.inputs["array"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      const trigger = node.connections.outputs["trigger"] ? node.connections.outputs["trigger"][0] : null
      if (!trigger) break
      variable[`${node.id}_item`] = `${replaceSpecialChar(node.id)}_item_result`
      result += `for (const ${replaceSpecialChar(node.id)}_item_result of ${variableName}) {\n${parseNode(rawNodesList[trigger.nodeId], rawNodesList, variable)};\n};\n`
      break
    }
    case "anyAsStr": {
      const nodeInfo = node.connections.inputs["any"] ? (node.connections.inputs["any"][0]) : null
      console.log({ nodeInfo })
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      result += `const ${replaceSpecialChar(node.id)}_result_result = ${variableName};\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "composeString": {
      const template: string | null = node.inputData.template.text
      if (!template) break
      const variables = template.replace(/\{(.*?)\}/g, (match, p1) => {
        const nodeInfo = node.connections.inputs[p1] ? (node.connections.inputs[p1][0]) : null
        if (!nodeInfo) return match
        const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
        if (!variableName) throw new Error("Variable Not Found")
        return `\${${variableName}}`
      })
      result += `const ${replaceSpecialChar(node.id)}_result_result = \`${variables}\`;\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "numberToString": {
      const nodeInfo = node.connections.inputs["number"] ? (node.connections.inputs["number"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      result += `const ${replaceSpecialChar(node.id)}_result_result = ${variableName}.toString();\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "stringToNumber": {
      const nodeInfo = node.connections.inputs["string"] ? (node.connections.inputs["string"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      result += `const ${replaceSpecialChar(node.id)}_result_result = Number(${variableName});\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "compareNumber": {
      let data1 = `${node.inputData.data1.number}`
      let data2 = `${node.inputData.data2.number}`
      for (const port in node.connections.inputs) {
        if (port == "data1") {
          const nodeInfo = (node.connections.inputs[port][0])
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          data1 = variableName
        }
        if (port == "data2") {
          const nodeInfo = (node.connections.inputs[port][0])
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          data2 = variableName
        }
      }
      let operator = "=="
      switch (node.inputData.operator.select) {
        case "equal":
          operator = "=="
          break
        case "greater":
          operator = ">"
          break
        case "less":
          operator = "<"
          break
        case "greaterEqual":
          operator = ">="
          break
        case "lessEqual":
          operator = "<="
          break
        case "notEqual":
          operator = "!="
          break
        default:
          console.log(node.inputData.operator.select)
      }
      result += `const ${replaceSpecialChar(node.id)}_result_result = ${data1} ${operator} ${data2};\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "sendMessageToChannel": {
      const nodeInfo = node.connections.inputs["channel"] ? (node.connections.inputs["channel"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      let content = node.inputData.content.text
      if (node.connections.inputs["content"]) {
        const nodeInfo = node.connections.inputs["content"] ? (node.connections.inputs["content"][0]) : null
        if (nodeInfo) {
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          content = variableName
        }
      }
      result += `const ${replaceSpecialChar(node.id)}_eventMessageSendData_result = await ${variableName}.send(${content});\n`
      variable[`${node.id}_eventMessageSendData_result`] = `${replaceSpecialChar(node.id)}_eventMessageSendData_result`
      break
    }
    case "sendMessageToUser": {
      const nodeInfo = node.connections.inputs["user"] ? (node.connections.inputs["user"][0]) : null
      if (!nodeInfo) break
      const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
      if (!variableName) throw new Error("Variable Not Found")
      let content = node.inputData.content.text
      if (node.connections.inputs["content"]) {
        const nodeInfo = node.connections.inputs["content"] ? (node.connections.inputs["content"][0]) : null
        if (nodeInfo) {
          const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
          if (!variableName) throw new Error("Variable Not Found")
          content = variableName
        }
      }
      result += `const ${replaceSpecialChar(node.id)}_eventMessageSendData_result = await ${variableName}.send(${content});\n`
      variable[`${node.id}_eventMessageSendData_result`] = `${replaceSpecialChar(node.id)}_eventMessageSendData_result`
      break
    }
    case "getChannel": {
      let channelId = node.inputData.channelId.text
      const nodeInfo = node.connections.inputs["channelId"] ? (node.connections.inputs["channelId"][0]) : null
      if (nodeInfo) {
        const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
        if (!variableName) throw new Error("Variable Not Found")
        channelId = variableName
      }
      result += `const ${replaceSpecialChar(node.id)}_result_result = await ${variable.client}.channels.fetch(${channelId});\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    case "getGuild": {
      let guildId = node.inputData.guildId.text
      const nodeInfo = node.connections.inputs["guildId"] ? (node.connections.inputs["guildId"][0]) : null
      if (nodeInfo) {
        const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
        if (!variableName) throw new Error("Variable Not Found")
        guildId = variableName
      }
      result += `const ${replaceSpecialChar(node.id)}_result_result = await ${variable.client}.guilds.fetch(${guildId});\n`
      variable[`${node.id}_result`] = `${replaceSpecialChar(node.id)}_result_result`
      break
    }
    default:
      console.log(node.type)
  }
  if (!nodeTriggerAfter) return result
  for (const e of nodeTriggerAfter) {
    const node = rawNodesList[e.nodeId]
    result += parseNode(node, rawNodesList, variable)
  }
  return result
}
function replaceSpecialChar(str: string) {
  return "a_" + str.replace(/-/g, "_").replace(/\s/g, "_")
}

function randomVariableName() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}