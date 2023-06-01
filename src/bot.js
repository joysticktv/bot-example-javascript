const magicWord = "tacos";
const gatewayIdentifier = JSON.stringify({channel: "GatewayChannel"});

const Bot = {
  handleMessage: (ws, receivedMessage)=> {
    console.log("\n\nMESSAGE", receivedMessage)
    
    if (receivedMessage.type === "ping") { return; }

    if (receivedMessage.message) {
      const message = receivedMessage.message;
      const channelId = message.channelId;
      if (message.type === "new_message") {
        if (message.text.toLowerCase() === "hello bot") {
          const response = {
            command: "message",
            identifier: gatewayIdentifier,
            data: JSON.stringify({
              action: "send_message",
              text: `Hello, @${message.author.username}!`,
              channelId: channelId,
            })
          };
          ws.send(JSON.stringify(response));
        }
        if (message.text.match(magicWord)) {
          const response = {
            command: "message",
            identifier: gatewayIdentifier,
            data: JSON.stringify({
              action: "send_message",
              text: `You said @${message.streamer.username}'s magic word!`,
              channelId: channelId,
            })
          };
          ws.send(JSON.stringify(response));
        }
      }
    }
  }
};

export default Bot;