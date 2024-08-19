import { AuthSchema } from "../AuthSchema";

export type AuthSignUpSchemaType = ReturnType<typeof AuthSchema.parse>;
