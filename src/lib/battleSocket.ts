import { refreshAccessToken } from "@/src/api/auth/useRefreshToken";
import { USE_LOCAL_API } from "@/src/lib/appMode";
import { useAuthStore } from "@/src/stores/useAuthStore";
import useUserStore from "@/src/stores/useUserStore";
import type {
  BattleEndedPayload,
  BattleStartPayload,
} from "@/src/types/battle";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL;
const normalizedServerUrl = serverUrl?.replace(/\/+$/, "");

type Ack = { success: boolean; error?: string };

type BattleEventMap = {
  "matchmaking:waiting": { queueSize: number };
  "matchmaking:found": {
    battleId: string;
    opponentId: string;
    opponentUsername: string;
    topics: string[];
  };
  "matchmaking:cancelled": { reason: string; battleId?: string };
  "battle:start": BattleStartPayload;
  "battle:opponent_progress": {
    battleId: string;
    userId: string;
    username: string;
    questionsCompleted: number;
  };
  "battle:opponent_finished": { userId: string; username: string };
  "battle:waiting": { battleId: string };
  "battle:ended": BattleEndedPayload;
  "battle:opponent_disconnected": {
    battleId: string;
    userId: string;
    username: string;
  };
  "battle:opponent_reconnected": {
    battleId: string;
    userId: string;
    username: string;
  };
  "battle:sync":
    | { inBattle: false }
    | {
        inBattle: true;
        battleId: string;
        players: { userId: string; username: string }[];
        questions: {
          question: string;
          options: string[];
          topic: string;
          answer?: string;
          solution?: string;
        }[];
        startedAt?: string;
        progress?: {
          questionsCompleted: number;
          totalQuestions: number;
          isFinished: boolean;
          selectedAnswers: string[];
        };
        opponentProgress?: {
          userId: string;
          username: string;
          questionsCompleted: number;
          isFinished: boolean;
        };
      };
};

let socket: Socket | null = null;
let socketToken: string | null = null;
let lastConnectionError: string | null = null;
let isRefreshingSocketToken = false;

const createSocket = () => {
  if (USE_LOCAL_API || !normalizedServerUrl) return null;

  return io(`${normalizedServerUrl}/battle`, {
    autoConnect: false,
    transports: ["websocket"],
    upgrade: false,
    auth: (cb) => {
      const { accessToken } = useAuthStore.getState();
      const { userId } = useUserStore.getState();
      cb({ token: accessToken, userId });
    },
  });
};

export const connectBattleSocket = (token: string) => {
  if (USE_LOCAL_API || !normalizedServerUrl) {
    lastConnectionError = "Battle connection is unavailable";
    return null;
  }

  if (!socket || socketToken !== token) {
    socket?.disconnect();
    const activeSocket = createSocket();
    if (!activeSocket) return null;

    socket = activeSocket;
    socketToken = token;
    lastConnectionError = null;

    activeSocket.on("connect", () => {
      lastConnectionError = null;
    });

    activeSocket.on("connect_error", (error: Error) => {
      lastConnectionError = error.message;

      const isUnauthorized =
        error.message === "Unauthorized" ||
        (error as Error & { data?: { status?: number } }).data?.status === 401;

      if (!isUnauthorized || isRefreshingSocketToken) return;

      isRefreshingSocketToken = true;
      refreshAccessToken()
        .then((newToken) => {
          socketToken = newToken;
          if (socket && !socket.connected) socket.connect();
        })
        .catch(() => {
          // If refresh fails, keep disconnected and surface latest auth error.
          lastConnectionError = "Unauthorized";
        })
        .finally(() => {
          isRefreshingSocketToken = false;
        });
    });
  }

  if (socket && !socket.connected) socket.connect();

  return socket;
};

export const ensureBattleSocketConnected = async (
  token: string,
  timeoutMs = 7000,
): Promise<Ack> => {
  const activeSocket = connectBattleSocket(token);

  if (!activeSocket) {
    return {
      success: false,
      error: lastConnectionError || "Socket connection is unavailable",
    };
  }

  if (activeSocket.connected) {
    return { success: true };
  }

  return new Promise((resolve) => {
    const onConnect = () => {
      cleanup();
      resolve({ success: true });
    };

    const onConnectError = (error: Error) => {
      cleanup();
      resolve({
        success: false,
        error: error.message || "Socket connect error",
      });
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve({
        success: false,
        error: lastConnectionError || "Socket connection timed out",
      });
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
      activeSocket.off("connect", onConnect);
      activeSocket.off("connect_error", onConnectError);
    };

    activeSocket.on("connect", onConnect);
    activeSocket.on("connect_error", onConnectError);
  });
};

export const getBattleSocket = () => socket;

export const disconnectBattleSocket = () => {
  socket?.disconnect();
  socket = null;
  socketToken = null;
};

export const emitBattleEventWithAck = <TPayload>(
  event: string,
  payload?: TPayload,
): Promise<Ack> => {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({
        success: false,
        error: lastConnectionError || "Socket is not connected",
      });
      return;
    }

    if (payload === undefined) {
      socket.emit(event, (ack: Ack) => resolve(ack));
      return;
    }

    socket.emit(event, payload, (ack: Ack) => resolve(ack));
  });
};

export const onBattleEvent = <TEvent extends keyof BattleEventMap>(
  event: TEvent,
  handler: (payload: BattleEventMap[TEvent]) => void,
) => {
  if (!socket) return () => {};

  const wrapped = (payload: BattleEventMap[TEvent]) => handler(payload);
  socket.on(event as string, wrapped as (...args: any[]) => void);
  return () =>
    socket?.off(event as string, wrapped as (...args: any[]) => void);
};
