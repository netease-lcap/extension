import { useEffect } from "react";
import { addMessageHandler, removeMessageHandler } from "../utils/socket";

export const useSocket = (handler: (message: string) => void) => {
  useEffect(() => {
    addMessageHandler(handler);
    return () => removeMessageHandler(handler);
  }, [handler]);
};
