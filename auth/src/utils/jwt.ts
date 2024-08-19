const salt = 10;
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import { getConfig } from "./createConfig";
import { ApiError } from "../errors/ApiError";

const privateKeyPath = path.join(__dirname, "../../private_key.pem");
// Read the private key from the file
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

const currentEnv = process.env.NODE_ENV || "development";
const config = getConfig(currentEnv);

export const generatePassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new ApiError("Unable to generate password");
  }
};
