export const MqttOptions = {
  keepalive: 30,
  clientId: "mqttjs_" + Math.random().toString(16).substring(2, 8),
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 0,
  connectTimeout: 60 * 1000,
  rejectUnauthorized: false,
};

export const MqttUrl = process.env.API_URL;
