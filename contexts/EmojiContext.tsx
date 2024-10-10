import { createContext, useCallback, useContext, useReducer } from "react";
import type { ReactNode } from "react";

interface EmojiContext {
  emojis: string[];
  dispatch: (action: EmojiAction) => void;
}

const EmojiContext = createContext<EmojiContext | null>(null);

interface EmojiAction {
  action: "add" | "delete";
  emoji?: string;
}

const emojiReducer = (emojis: string[], action: EmojiAction) => {
  if (action.action === "delete") {
    emojis.pop();
    return [...emojis];
  } else {  // add
    return [...emojis, action.emoji];
  }
};

export const useEmojiContext = () => {
  const ctx = useContext(EmojiContext);
  if (ctx === null) {
    throw new Error("No Sticker context found");
  }
  const { emojis, dispatch } = ctx;
  const addEmoji = useCallback(
    (emoji: string) => {
      dispatch({ action: "add", emoji });
    },
    [dispatch]
  );
  const clearEmojis = () => {
    const length = emojis.length;
    for (let i = 0; i < length; i++) {
      dispatch({ action: "delete" });
    }
  };
  const undoLastEmoji = () => {
    dispatch({ action: "delete" });
  };

  return {
    emojis,
    addEmoji,
    clearEmojis,
    undoLastEmoji,
  };
};

interface EmojiProviderProps {
  children: ReactNode | ReactNode[];
}

export const EmojiProvider = ({ children }: EmojiProviderProps) => {
  const [emojis, dispatch] = useReducer(emojiReducer, []);
  return (
    <EmojiContext.Provider value={{ emojis, dispatch }}>
      {children}
    </EmojiContext.Provider>
  );
};
