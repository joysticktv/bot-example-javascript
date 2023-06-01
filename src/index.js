import * as dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import Bot from "./bot.js";
import express from "express";
import WebSocket from "ws";

const app = express();

const host = process.env.JOYSTICKTV_HOST;
const clientId = process.env.JOYSTICKTV_CLIENT_ID;
const clientSecret = process.env.JOYSTICKTV_CLIENT_SECRET;
const wsHost = process.env.JOYSTICKTV_API_HOST;
const accessToken = Buffer.from(clientId + ":" + clientSecret).toString("base64");
const gatewayIdentifier = JSON.stringify({channel: "GatewayChannel"});

const url = `${wsHost}?token=${accessToken}`;
const ws = new WebSocket(url, ["actioncable-v1-json"]);

ws.on("open", function open() {
  console.log("connection has opened")
  const message = {
    command: "subscribe",
    identifier: gatewayIdentifier,
  };

  ws.send(JSON.stringify(message));
});

ws.on('error', console.error);

ws.on('close', function close() {
  console.log('connection has closed');
});

let connected = false;

ws.on("message", function message(data) {
  const receivedMessage = JSON.parse(data);

  switch (receivedMessage.type) {
    case "reject_subscription":
      console.log("nope... no connection for you");
      break;
    case "confirm_subscription":
      console.log("confirmed subscription");
      connected = true
      break;
  }

  if (connected) {
    Bot.handleMessage(ws, receivedMessage);
  }
});

app.get('/', (_req, res) => {
  res.send(`Visit <a href="/install">INSTALL</a> to install Bot`);
});

app.get('/install', (_req, res) => {
  const state = "abcexpress123";
  const clientRequestParams = new URLSearchParams();
  clientRequestParams.append("client_id", clientId);
  clientRequestParams.append("scope", "bot");
  clientRequestParams.append("state", state);
  
  const authorizeUri = `${host}/api/oauth/authorize?${clientRequestParams.toString()}`;
  res.redirect(authorizeUri);
});

app.get('/callback', async (req, res) => {
  // STATE should equal `abcexpress123`
  console.log("STATE:", req.query.state);
  console.log("CODE:", req.query.code);
  const clientRequestParams = new URLSearchParams();
  clientRequestParams.append("redirect_uri", "/unused");
  clientRequestParams.append("code", req.query.code);
  clientRequestParams.append("grant_type", "authorization_code");

  const response = await fetch(`${host}/api/oauth/token?${clientRequestParams.toString()}`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + accessToken,
      "Content-Type": "application/json",
    },
    body: "",
  });

  const data = await response.json();

  // Save to your DB if you need to request user data
  console.log(data.access_token);
  res.send("Bot has been activated");
});

console.log("listening...");
app.listen(8080);
