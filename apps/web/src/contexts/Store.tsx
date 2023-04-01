import { useImmerReducer } from "@hooks/useImmerReducer";
import { parsedTexts } from "@szmaciura/shared";
import React, { createContext, useContext } from "react";

const getInputMaxLength = (activeWord: string): number => {
  const length = activeWord.length * 2;
  return length >= 8 ? length : 8;
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
};

const StoreContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});
export type Action =
  | {
      type:
        | "RESET"
        | "PROCEED_TO_NEXT_WORD"
        | "INPUT_EMPTY"
        | "CORRECT_INPUT_VALUE"
        | "RACE_COMPLETED";
    }
  | { type: "SET_TEXT_BY_ID"; payload: string }
  | { type: "SET_INPUT_LENGTH"; payload: number }
  | { type: "SET_INPUT_LENGTH"; payload: number }
  | { type: "SET_ERROR"; payload: boolean };

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
    default:
      throw new Error("Invalid action type");
  }
};

type StoreContextProviderProps = { children: React.ReactNode };

const StoreContextProvider = ({ children }: StoreContextProviderProps) => {
  const [state, dispatch] = useImmerReducer<State, Action>(
    reducer,
    initialState
  );

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
