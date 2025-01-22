import { Server } from "http";

declare module "socket.io" {
  interface Socket {
    server: Server;
  }
}
