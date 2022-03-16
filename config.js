const yaml = require("js-yaml");
const fs = require("fs");

const doc = yaml.load(fs.readFileSync(__dirname + "/config.yml", "utf8"));

module.exports = {
  config: function (productionMode) {
    let env = process.env.NODE_ENV || "development";
    const config = {};

    // use node_env section of the config.yml
    // then if in production mode: fallback to 'production' section
    // finally fallback to 'default' section

    for (let key in doc.default) {
      config[key] = doc.default[key];
    }

    if (productionMode) {
      for (let key in doc.production) {
        config[key] = doc.production[key];
      }
    }

    for (let key in doc[env]) {
      config[key] = doc[env][key];
    }

    if (productionMode) {
      env = process.env.NODE_ENV = "production";
    } else {
      env = process.env.NODE_ENV = "development";
    }

    return {
      devServerPort: config.dev_server_port,
      environmentVars: {
        "process.env.NODE_ENV": JSON.stringify(env),
        "process.env.API_URL": JSON.stringify(config.api_url),
      },
    };
  },
};
