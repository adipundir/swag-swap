import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore test files and test dependencies
    const webpack = require("webpack");
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test\//,
        contextRegExp: /thread-stream/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^(tap|tape|why-is-node-running)$/,
      })
    );

    // Ignore test directories via resolve alias
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'tap': false,
      'tape': false,
      'why-is-node-running': false,
    };

    return config;
  },
};

export default nextConfig;
