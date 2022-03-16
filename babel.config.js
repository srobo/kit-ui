module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: [">1%", "not ie 11", "not op_mini all"],
          },
        },
      ],
      [
        "@babel/preset-react",
        {
          development: process.env.NODE_ENV !== "production",
        },
      ],
    ],
    targets: {
      browsers: [">1%", "not ie 11", "not op_mini all"],
    },
  };
};
