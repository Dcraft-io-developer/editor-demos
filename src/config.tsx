import { FlumeConfig, Controls, Colors } from "flume";

export const flumeConfig = new FlumeConfig();

flumeConfig
  .addPortType({
    type: "number",
    name: "number",
    label: "Number",
    color: Colors.red,
    controls: [
      Controls.number({
        name: "num",
        label: "Number",
      }),
    ],
  })
  .addPortType({
    type: "compareNumberType",
    name: "compareNumberType",
    label: "Type of Compare",
    color: Colors.red,
    controls: [
      Controls.select({
        defaultValue: "equal",
        options: [
          {
            label: "Equal",
            value: "equal",
          },
          {
            label: "Greater Than",
            value: "greaterThan",
          },
          {
            label: "Less Than",
            value: "lessThan",
          },
          {
            label: "Greater Than Or Equal",
            value: "greaterThanOrEqual",
          },
          {
            label: "Less Than Or Equal",
            value: "lessThanOrEqual",
          },
          {
            label: "Not Equal",
            value: "notEqual",
          },
        ],
      }),
    ],
  })
  .addPortType({
    type: "trigger",
    name: "triggerPort",
    label: ">",
    color: Colors.grey,
    controls: [],
  })
  .addPortType({
    type: "eventMessageSendData",
    name: "eventMessageSendData",
    label: "Data of event",
    color: Colors.red,
    controls: [Controls.custom({ label: "Event Data" })],
  })
  .addPortType({
    type: "string",
    name: "string",
    label: "string result",
    color: Colors.red,
    controls: [Controls.text({})],
  })
  .addPortType({
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
            value: "equal",
          },
          {
            label: "Starts With",
            value: "startsWith",
          },
        ],
      }),
    ],
  })
  .addPortType({
    type: "any",
    name: "any",
    label: "any type",
    color: Colors.red,
    controls: [],
  })
  .addPortType({
    type: "boolean",
    name: "boolean",
    label: "boolean",
    color: Colors.red,
    controls: [Controls.checkbox({})],
  })
  .addPortType({
    type: "array",
    name: "array",
    label: "array",
    color: Colors.red,
    controls: [
      // Controls.custom({ label: "Array", render: () => <div>Array</div> }),
    ],
  })
  .addPortType({
    type: "channel",
    name: "channel",
    label: "channel",
    color: Colors.red,
    controls: [
      Controls.custom({ label: "Channel", render: () => <div>Channel</div> }),
    ],
  })
  .addPortType({
    type: "guild",
    name: "guild",
    label: "guild",
    color: Colors.red,
    controls: [
      Controls.custom({ label: "Guild", render: () => <div>Guild</div> }),
    ],
  })
  .addPortType({
    type: "user",
    name: "user",
    label: "user",
    color: Colors.red,
    controls: [
      Controls.custom({ label: "User", render: () => <div>User</div> }),
    ],
  })
  .addPortType({
    type: "role",
    name: "role",
    label: "role",
    color: Colors.red,
    controls: [
      Controls.custom({ label: "Role", render: () => <div>Role</div> }),
    ],
  })
  .addPortType({
    type: "member",
    name: "member",
    label: "member",
    color: Colors.red,
    controls: [
      Controls.custom({ label: "Member", render: () => <div>Member</div> }),
    ],
  });

flumeConfig
  .addNodeType({
    type: "triggerOnMessageSend",
    label: "On Message Send",
    description: "Triggers when a message is sent",
    initialWidth: 150,
    inputs: (port) => [
      port.boolean({ name: "skipBot", label: "skip bot", hidePort: true }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger the flow" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "message data",
      }),
    ],
  })
  .addNodeType({
    type: "getMessageContent",
    label: "Get Message Content",
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger node after this node" }),
      port.string({
        name: "messageContent",
        label: "String content of message",
      }),
    ],
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "result of EventNode",
      }),
    ],
  })
  .addNodeType({
    type: "compareStringNode",
    label: "Compare String Node",
    description: "Compares two strings with the given compare type",
    inputs: (port) => [
      port.compareType({
        name: "compareType",
        label: "compare type",
        hidePort: true,
      }),
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.string({ name: "data1", label: "data1" }),
      port.string({
        name: "data2",
        label: "data2",
      }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.boolean({ name: "result", label: "result of if node" }),
    ],
  })
  .addNodeType({
    type: "reverseTrueFalse",
    label: "Reverse True False",
    description: "Reverses a boolean value from true to false and vice versa",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.boolean({ name: "value", label: "value" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.boolean({
        name: "result",
        label: "result",
      }),
    ],
  })
  .addNodeType({
    type: "if",
    label: "If",
    description:
      "If the input is true, triggers the trueTrigger, else triggers the falseTrigger",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.boolean({ name: "value", label: "value" }),
    ],
    outputs: (port) => [
      port.trigger({
        name: "trueTrigger",
        label: "trigger to when input is true",
      }),
      port.trigger({
        name: "falseTrigger",
        label: "trigger to when input is false",
      }),
    ],
  })
  .addNodeType({
    type: "sendMessage",
    label: "Send Discord Message",
    description: "Sends a message to a channel or reply to a message",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "message data",
      }),
      port.string({ name: "content", label: "message content" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "message data",
      }),
    ],
  })
  .addNodeType({
    type: "extractMessageEvent",
    label: "Extract Message Event",
    description:
      "Extracts the message event from the event message send data, and outputs the content, id, author, channel, guild, and member",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "message data",
      }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.string({ name: "content", label: "message content" }),
      port.number({ name: "id", label: "id" }),
      port.user({ name: "author", label: "author" }),
      port.channel({ name: "channel", label: "channel" }),
      port.guild({ name: "guild", label: "guild" }),
      port.member({ name: "member", label: "member" }),
    ],
  })
  .addNodeType({
    type: "splitString",
    label: "Split String",
    description:
      "Splits a string into an array of substrings using the specified separator",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.string({ name: "string", label: "string" }),
      port.string({ name: "separator", label: "separator", hidePort: true }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.array({ name: "result", label: "result" }),
    ],
  })
  .addNodeType({
    type: "forEach",
    label: "For Each",
    description:
      "Loops through each item in the array and triggers the node after this node for each item",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.array({ name: "array", label: "array" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.any({ name: "item", label: "item" }),
    ],
  })
  .addNodeType({
    type: "anyAsStr",
    label: "Any to String",
    description: "Converts any type to string",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.any({ name: "any", label: "any" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.string({ name: "result", label: "result" }),
    ],
  })
  .addNodeType({
    type: "composeString",
    label: "Compose String",
    description: "Composes a parameterized string of text",
    initialWidth: 230,
    inputs: (ports) => (data) => {
      const template = (data && data.template && data.template.text) || "";
      const re = /\{(.*?)\}/g;
      let res = null;
      const ids: string[] = [];
      while ((res = re.exec(template)) !== null) {
        if (!ids.includes(res[1])) ids.push(res[1]);
      }
      return [
        ports.trigger({ name: "trigger", label: "Trigger" }),
        ports.string({ name: "template", label: "Template", hidePort: true }),
        ...ids.map((id) => ports.string({ name: id, label: id })),
      ];
    },
    outputs: (ports) => [ports.string({ label: "Message", name: "result" })],
  })
  .addNodeType({
    type: "numberToString",
    label: "Number to String",
    description: "Converts a number to a string",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.number({ name: "number", label: "number" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.string({ name: "result", label: "result" }),
    ],
  })
  .addNodeType({
    type: "stringToNumber",
    label: "String to Number",
    description: "Converts a string to a number",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.string({ name: "string", label: "string" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.number({ name: "result", label: "result" }),
    ],
  })
  .addNodeType({
    type: "compareNumberNode",
    label: "Compare Number",
    description: "Compares two numbers with the given compare type",
    inputs: (port) => [
      port.compareNumberType({
        name: "compareType",
        label: "compare type",
        hidePort: true,
      }),
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.number({ name: "data1", label: "data1" }),
      port.number({
        name: "data2",
        label: "data2",
      }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.boolean({ name: "result", label: "result of if node" }),
    ],
  })
  .addNodeType({
    type: "sendMessageToChannel",
    label: "Send Message to Channel",
    description: "Sends a message to a channel",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.channel({ name: "channel", label: "channel" }),
      port.string({ name: "content", label: "message content" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "message data",
      }),
    ],
  })
  .addNodeType({
    type: "sendMessageToUser",
    label: "Send Message to User",
    description: "Sends a message to a user",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.user({ name: "user", label: "user" }),
      port.string({ name: "content", label: "message content" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.eventMessageSendData({
        name: "eventMessageSendData",
        label: "message data",
      }),
    ],
  })
  .addNodeType({
    type: "getChannel",
    label: "Get Channel",
    description: "Gets a channel by its id",
    inputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger from" }),
      port.string({ name: "id", label: "channel id" }),
    ],
    outputs: (port) => [
      port.trigger({ name: "trigger", label: "trigger to" }),
      port.channel({ name: "channel", label: "channel" }),
    ],
  });
