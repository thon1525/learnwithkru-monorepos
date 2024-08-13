import { getConfig } from "./createConfig";

const config = getConfig(process.env.NODE_ENV);

export const optionKsession: CookieSessionInterfaces.CookieSessionOptions = {
  name: "session",
  keys: [`${config.cookieSecretKeyOne}`, `${config.cookieSecretKeyTwo}`],
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  overwrite: true,
  path: "/",
};
