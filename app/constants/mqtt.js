export const MqttOptions = {
  keepalive: 30,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 0,
  connectTimeout: 60 * 1000,
  rejectUnauthorized: false,
};

export const MqttUrl = process.env.API_URL;
