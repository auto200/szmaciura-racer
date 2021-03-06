import React, { createContext, useContext, useEffect, useRef } from "react";
import { useImmerReducer } from "../utils/hooks/useImmerReducer";
import { v4 as uuid } from "uuid";
import { parsedTexts } from "@shared/utils";

const getInputMaxLength = (activeWord: string): number => {
  const length = activeWord.length * 2;
  return length >= 8 ? length : 8;
};

const getInitialHistoryObject = () => {
  const initial: any = {};
  for (const key in parsedTexts) {
    initial[key] = [];
  }
  return initial as GamesHistory;
};

type GamesHistory = {
  [key: string]: HistoryEntry[];
};

export type HistoryEntry = {
  id: string;
  timestamp: number;
  time: string;
};

export interface State {
  text: string[];
  textID: string;
  wordIndex: number;
  inputLength: number;
  lastValidCharIndex: number;
  inputMaxLength: number;
  error: boolean;
  onCompleteModalShown: boolean;
  history: GamesHistory;
}
const initialText = Object.values(parsedTexts)[0];

const initialState: State = {
  text: initialText,
  textID: Object.keys(parsedTexts)[0],
  wordIndex: 0,
  inputLength: 0,
  lastValidCharIndex: -1,
  inputMaxLength: getInputMaxLength(initialText[0]),
  error: false,
  onCompleteModalShown: false,
  history: getInitialHistoryObject(),
};

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});
export type Action =
  | { type: "SET_TEXT_BY_ID"; payload: string }
  | {
      type:
        | "RESET"
        | "PROCEED_TO_NEXT_WORD"
        | "INPUT_EMPTY"
        | "CORRECT_INPUT_VALUE";
    }
  | { type: "RACE_COMPLETED"; payload: string }
  | { type: "SET_INPUT_LENGTH"; payload: number }
  | { type: "SET_ERROR"; payload: boolean }
  | { type: "SET_HISTORY_OBJECT"; payload: GamesHistory };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_TEXT_BY_ID": {
      state.textID = action.payload;
      state.text = parsedTexts[action.payload];
      return;
    }
    case "RESET": {
      state.wordIndex = 0;
      state.lastValidCharIndex = -1;
      state.onCompleteModalShown = false;
      state.inputLength = 0;
      return;
    }
    case "SET_INPUT_LENGTH": {
      state.inputLength = action.payload;
      return;
    }
    case "RACE_COMPLETED": {
      state.onCompleteModalShown = true;
      if (state.history?.[state.textID]) {
        state.history[state.textID].unshift({
          id: uuid(),
          timestamp: Date.now(),
          time: action.payload,
        });
      }
      return;
    }
    case "PROCEED_TO_NEXT_WORD": {
      const nextWordIndex = state.wordIndex + 1;
      state.wordIndex = nextWordIndex;
      state.lastValidCharIndex = -1;
      state.inputLength = 0;
      state.inputMaxLength = getInputMaxLength(state.text[nextWordIndex]);
      return;
    }
    case "INPUT_EMPTY": {
      state.lastValidCharIndex = -1;
      state.error = false;
      return;
    }
    case "CORRECT_INPUT_VALUE": {
      state.lastValidCharIndex = state.inputLength - 1;
      state.error = false;
      return;
    }
    case "SET_ERROR": {
      state.error = action.payload;
      return;
    }
    case "SET_HISTORY_OBJECT": {
      state.history = action.payload;
      return;
    }
    default:
      throw new Error("Invalid action type");
  }
};

const StoreContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useImmerReducer<State, Action>(
    reducer,
    initialState
  );
  const initialRednerRef = useRef<boolean>(true);

  useEffect(() => {
    try {
      if (initialRednerRef.current) {
        const storedHistory = window.localStorage.getItem("history");
        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          if (typeof parsedHistory === "object" && parsedHistory !== null) {
            dispatch({ type: "SET_HISTORY_OBJECT", payload: parsedHistory });
          } else {
            throw new Error();
          }
        }
      } else {
        window.localStorage.setItem("history", JSON.stringify(state.history));
      }
    } catch (err) {}
    initialRednerRef.current = false;
  }, [state.history]);

  const values = {
    state,
    dispatch,
  };

  return (
    <StoreContext.Provider value={values}>{children}</StoreContext.Provider>
  );
};

export default StoreContextProvider;

export const useStore = () => useContext(StoreContext);
