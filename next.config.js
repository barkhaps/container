// container/next.config.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;

module.exports = {
  webpack(config, { isServer }) {
    console.log("[container next.config] isServer =", isServer);
    if (!isServer) {
      console.log("[container MF] enabling Module Federation (client only)");
      config.plugins.push(
        new ModuleFederationPlugin({
          name: "container",
          remotes: {
            // must match the path you just verified in the browser
            CollectoApp: "CollectoApp@http://localhost:3001/_next/static/chunks/remoteEntry.js",
          },
          shared: {
            react: { singleton: true, requiredVersion: false, strictVersion: false, eager: true },
            "react-dom": { singleton: true, requiredVersion: false, strictVersion: false, eager: true },
          },
        })
      );
      // Optional: quiet async/await warning
      config.output = {
        ...(config.output ?? {}),
        environment: { ...(config.output?.environment ?? {}), asyncFunction: true },
      };
    }
    return config;
  },
};
