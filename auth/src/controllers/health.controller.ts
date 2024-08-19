import { Get, Route, SuccessResponse } from "tsoa";
import { StatusCode } from "../utils/StatusCode";

@Route("/auth-health")
export class Health {
  @SuccessResponse(StatusCode.OK, "Success")
  @Get("/")
  public async checkHealth() {
    return { message: "API auth service is healthy and OK." };
  }
}
