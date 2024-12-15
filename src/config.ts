import { FlumeConfig, Controls, Colors } from "flume";

export const flumeConfig = new FlumeConfig()

flumeConfig
  .addPortType({
    type: "number",
    name: "number",
    label: "Number",
    color: Colors.red,
    controls: [
      Controls.number({
        name: "num",
        label: "Number"
      })
    ]
  })
  .addPortType({
    type: "trigger",
    name: "triggerPort",
    label: ">",
    color: Colors.grey,
    controls: [
    ]
  })
  .addPortType({
    type: "eventMessageSendData",
    name: "eventMessageSendData",
    label: "Data of event",
    color: Colors.red,
    controls: [
      Controls.custom({ label: "Event Data" })
    ]
  }).addPortType({
    type: "string",
    name: "string",
    label: "string result",
    color: Colors.red,
    controls: [
      Controls.text({})
    ]
  }).addPortType({
    type: "compareType",
    name: "compareType",
    label: "Type of Compare",
    color: Colors.red,
    controls: [
      Controls.select({
        defaultValue: "equal",
        options: [
          {
            label: "Equal",
            value: "equal"
          }
        ]
      })
    ]
  }).addPortType({
    type: "any",
    name: "any",
    label: "any type",
    color: Colors.red,
    controls: [
    ]
  })
  .addPortType({
    type: "boolean",
    name: "boolean",
    label: "boolean",
    color: Colors.red,
    controls: [
      Controls.checkbox({})
    ]
  })

flumeConfig
  .addNodeType({
    type: "triggerOnMessageSend",
    label: "On Message Send",
    initialWidth: 150,
    outputs: port => [
      port.trigger({ name: "trigger", label: "trigger the flow" }),
      port.eventMessageSendData({ name: "eventMessageSendData", label: "message data" })
    ],
  })
  .addNodeType({
    type: "getMessageContent",
    label: "Get Message Content",
    outputs: port => [
      port.trigger({ name: "trigger", label: "trigger node after this node" }),
      port.string({ name: "messageContent", label: "String content of message" }),
    ],
    inputs: port => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.eventMessageSendData({ name: "eventMessageSendData", label: "result of EventNode" })
    ]
  }).addNodeType({
    type: "compareNode",
    label: "Compare String Node",
    inputs: port => [
      port.compareType({ name: "compareType", label: "compare type", hidePort: true }),
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.string({ name: "data1", label: "data1", }),
      port.string({
        name: "data2", label: "data2",
      })
    ],
    outputs: port => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.boolean({ name: "result", label: "result of if node" })
    ]
  }).addNodeType({
    type: "reverseTrueFalse",
    label: "Reverse True False",
    inputs: port => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.boolean({ name: "value", label: "value" })
    ],
    outputs: port => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.boolean({
        name: "result", label: "result"
      })
    ]
  }).addNodeType({
    type: "if",
    label: "if",
    inputs: port => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.boolean({ name: "value", label: "value" })
    ],
    outputs: port => [
      port.trigger({ name: "trueTrigger", label: "trigger to when input is true" }),
      port.trigger({ name: "falseTrigger", label: "trigger to when input is false" }),
    ]
  }).addNodeType(
    {
      type: "sendMessage",
      label: "send discord message",
      inputs: port => [
        port.trigger({ name: "trigger", label: "trigger from" }),
        port.eventMessageSendData({ name: "eventMessageSendData", label: "message data" }),
        port.string({ name: "content", label: "message content" }),
      ],
      outputs: port => [
        port.trigger({ name: "trigger", label: "trigger to" }),
        port.eventMessageSendData({ name: "eventMessageSendData", label: "message data" }),
      ]
    }
  )