import app from "./app";
import MongoDBConnector from "./controllers";
import { getConfig } from "./utils/createConfig";
async function initializeDatabase(mongoUrl: string) {
  const mongodb = MongoDBConnector.getInstance();
  await mongodb.connect({ url: mongoUrl });
  return mongodb;
}

async function startServer(port: number) {
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
async function run() {
  let server: ReturnType<typeof app.listen> | null = null;
  let mongodb: MongoDBConnector | null = null;
  try {
    const currentEnv = process.env.NODE_ENV || "development";
    const config = getConfig(currentEnv);
    mongodb = await initializeDatabase(config.mongoUrl!);
    server = await startServer(parseInt(config.port!));
  } catch (error: unknown) {
    if (mongodb) {
      await mongodb.disconnect();
    process.exit(1);
    }
  }
}

run();
