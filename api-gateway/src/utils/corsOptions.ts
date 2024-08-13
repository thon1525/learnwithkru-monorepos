import { getConfig } from "./createConfig";

const config = getConfig(process.env.NODE_ENV);

const coreOption = {
  origin:
    config.env === "development" ? "http://localhost:8000" : config.clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default coreOption;
