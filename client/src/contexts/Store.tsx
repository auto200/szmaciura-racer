import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useImmerReducer } from "../utils/hooks/useImmerReducer";
import { v4 as uuid } from "uuid";
import { getInputMaxLength } from "../utils";

const szmaciuraText =
  "ty no nie wiem jak tam twoja szmaciura jebana zrogowaciala niedzwiedzica co sie kurwi pod mostem za wojaka i siada kurwa na butle od vanisha i kurwe w taczce pijana wozili po osiedlu wiesz o co chodzi mnie nie przegadasz bo mi sperme z paly zjadasz frajerze zrogowacialy frajerska chmuro chuj ci na matule i jebac ci starego";
const splittedText = szmaciuraText.split(" ");

export type History = {
  id: string;
  timestamp: number;
  time: string;
};

export interface State {
  text: string[];
  wordIndex: number;
  lastValidCharIndex: number;
  inputValue: string;
  inputMaxLength: number;
  error: boolean;
  timePassed: string;
  onCompleteModalShown: boolean;
  history: History[];
  socket?: SocketIOClient.Socket;
}

const initialState: State = {
  text: splittedText,
  wordIndex: 0,
  lastValidCharIndex: -1,
  inputValue: "",
  inputMaxLength: getInputMaxLength(splittedText[0]),
  error: false,
  timePassed: "0",
  onCompleteModalShown: false,
  history: [],
  socket: undefined,
};

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});
export type Action =
  | { type: "SET_WORD_INDEX"; payload: number }
  | { type: "SET_INPUT_VALUE"; payload: string }
  | {
      type:
        | "RESET"
        | "RACE_COMPLETED"
        | "PROCEED_TO_NEXT_WORD"
        | "INPUT_EMPTY"
        | "CORRECT_INPUT_VALUE";
    }
  | { type: "SET_TIME_PASSED"; payload: string }
  | { type: "SET_ERROR"; payload: boolean }
  | { type: "SET_TIME_PASSED"; payload: string }
  | { type: "SET_HISTORY"; payload: History[] }
  //online
  | { type: "SET_SOCKET"; payload: SocketIOClient.Socket }
  | { type: "CLOSE_SOCKET" };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_WORD_INDEX": {
      state.wordIndex = action.payload;
      return;
    }
    case "RESET": {
      state.wordIndex = 0;
      state.lastValidCharIndex = -1;
      state.inputValue = "";
      state.timePassed = "0";
      state.onCompleteModalShown = false;
      return;
    }
    case "SET_TIME_PASSED": {
      state.timePassed = action.payload;
      return;
    }
    case "RACE_COMPLETED": {
      state.onCompleteModalShown = true;
      state.history.unshift({
        id: uuid(),
        timestamp: Date.now(),
        time: state.timePassed,
      });
      return;
    }
    case "PROCEED_TO_NEXT_WORD": {
      const nextWordIndex = state.wordIndex + 1;
      state.wordIndex = nextWordIndex;
      state.inputValue = "";
      state.lastValidCharIndex = -1;
      state.inputMaxLength = getInputMaxLength(state.text[nextWordIndex]);
      return;
    }
    case "INPUT_EMPTY": {
      state.lastValidCharIndex = -1;
      state.error = false;
      return;
    }
    case "CORRECT_INPUT_VALUE": {
      state.lastValidCharIndex = state.inputValue.length - 1;
      state.error = false;
      return;
    }
    case "SET_ERROR": {
      state.error = action.payload;
      return;
    }
    case "SET_TIME_PASSED": {
      state.timePassed = action.payload;
      return;
    }
    case "SET_INPUT_VALUE": {
      state.inputValue = action.payload;
      return;
    }
    case "SET_HISTORY": {
      state.history = action.payload;
      return;
    }
    //online
    case "SET_SOCKET": {
      state.socket = action.payload;
      return;
    }
    case "CLOSE_SOCKET": {
      state.socket = undefined;
      return;
    }
    default:
      throw new Error("Invalid action type");
  }
};

const StoreContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useImmerReducer<State, Action>(
    reducer,
    initialState
  );

  useEffect(() => {
    if (!state.history.length) {
      try {
        const storedHistory = window.localStorage.getItem("history");
        if (!storedHistory) return;
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          dispatch({ type: "SET_HISTORY", payload: parsedHistory });
        } else {
          throw new Error();
        }
      } catch (err) {
        //data corrupted or smth
        dispatch({ type: "SET_HISTORY", payload: [] });
      }
    } else {
      try {
        window.localStorage.setItem("history", JSON.stringify(state.history));
      } catch (err) {}
    }
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
