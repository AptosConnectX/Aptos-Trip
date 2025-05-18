const { override, addWebpackAlias, addWebpackModuleRule } = require("customize-cra");
const path = require("path");

module.exports = override(
  addWebpackAlias({
    "@": path.resolve(__dirname, "src")
  }),
  addWebpackModuleRule({
    test: /\.(glsl|vs|fs)$/,
    use: "raw-loader",
  })
);
