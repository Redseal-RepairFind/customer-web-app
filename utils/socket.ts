// lib/socketService.ts
import { io, Socket } from "socket.io-client";
import { readStringCookie } from "@/lib/helpers";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_API_SOCKET_URL}`;

interface ISocketService {
  socket: Socket;
  connected: boolean;
  connect(): void;
  disconnect(): void;
  sendData<T>(event: string, data: T): void;
  subscribe(event: string, callback: (data: any) => void): void;
  unsubscribe(event: string): void;
}

class SocketService implements ISocketService {
  socket: Socket;
  connected: boolean;

  constructor() {
    this.socket = io(SOCKET_URL, { autoConnect: false });
    this.connected = false;
  }

  async connect(): Promise<void> {
    try {
      // Read token from cookies
      const token = readStringCookie(process.env.NEXT_PUBLIC_TOKEN_COOKIE);

      // console.log(token);

      // console.log("Token from cookies:", token);
      console.log("Attempting to connect...");

      this.socket.io.opts.extraHeaders = {
        token: token ? `${token}` : "",
      };

      this.socket.on("connect", () => {
        this.connected = true;
        console.log("✅ Connected to socket server");
      });

      this.socket.on("connect_error", (error: Error) => {
        console.error("❌ Connection error:", error.message);
        this.connected = false;
      });

      // this.socket.onAny((event, ...args) => {
      //   console.log(`📩 Event received: ${event}`, args);
      // });

      this.socket.connect();
    } catch (error) {
      console.error("Socket connection failed:", error);
    }
  }

  disconnect(): void {
    this.socket.disconnect();
    this.connected = false;
    console.log("🔌 Disconnected from socket server");
  }

  sendData<T>(event: string, data: T): void {
    this.socket.emit(event, data);
    console.log(`📤 Data sent on event '${event}':`, data);
  }

  subscribe(event: string, callback: (data: any) => void): void {
    this.socket.on(event, callback);
    console.log(`👂 Subscribed to event '${event}'`);
  }

  unsubscribe(event: string): void {
    this.socket.off(event);
    console.log(`🚫 Unsubscribed from event '${event}'`);
  }
}

const SocketsService = new SocketService();

export default SocketsService;
