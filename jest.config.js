module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "babel",

  // A list of reporter names that Jest uses when writing coverage reports.
  coverageReporters: ["lcov"],

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ["node_modules", "app"],

  // The test environment that will be used for testing
  testEnvironment: "node",
};
