export const MqttTopics = {
  UserCodeLog: "astoria/broadcast/usercode_log",
  StartButton: "astoria/broadcast/start_button",
  astdiskd: "astoria/astdiskd",
  astmetad: "astoria/astmetad",
  astprocd: "astoria/astprocd",
  ProcessRequest: (type) => `astoria/astprocd/request/${type}`,
  ProcessRequestIndividual: (type, uuid) =>
    `astoria/astprocd/request/${type}/${uuid}`,
  MutateRequest: "astoria/astmetad/request/mutate/",
  MutateRequestIndividual: (uuid) => `astoria/astmetad/request/mutate/${uuid}`,
  EventBroadcast: (eventType) => `astoria/broadcast/${eventType}`,
};

export const LogMessageRegex = /\[(\d+:\d{2}:\d{2}\.\d+)] (.*)/;
