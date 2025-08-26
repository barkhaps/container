import path from "path";

const config = {
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@app": path.resolve(__dirname, "src/app"),
      },
    },
  };
  

export default config;