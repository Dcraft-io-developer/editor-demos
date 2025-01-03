import { FlumeNode, NodeMap } from "flume";

// interface Node extends FlumeNode {
//   children: Node[]
// }

const template = `import { Client, Events, GatewayIntentBits } from "discord.js";

const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });

client.on("ready", async (interaction) => {
  console.log("Bot is ready");
});
\n`

export function buildNodeToCode(rawNodes: NodeMap) {
  // console.log({ nodes: rawNodes })
  const triggerNode = [];
  for (const key in rawNodes) {
    const node = rawNodes[key]
    if (node.type == "triggerOnMessageSend") {
      triggerNode.push(node)
    }
  }
  let result = template
  const variable = {} as Record<string, string>
  for (const n of triggerNode) {
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
    case "compareNode": {
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
        if (!nodeInfo) break
        const variableName = variable[nodeInfo.nodeId + "_" + nodeInfo.portName]
        if (!variableName) throw new Error("Variable Not Found")
        content = variableName
      }
      result += `const ${replaceSpecialChar(node.id)}_eventMessageSendData_result = await ${messageVariableName}.channel.send(\`${content}\`);\n`
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