import { State } from "../contexts/Store";

export interface Achievement {
  name: string;
  status: {
    done: boolean;
    level: number;
    doneTimestamp: number[];
  };
  check: (state: State) => number;
}

const LongRunner: Achievement = {
  name: "egi wymysl nazwe",
  status: {
    done: false,
    level: 0,
    doneTimestamp: [0],
  },
  check: state => {
    let level = 0;
    if (state.history.length >= 300) {
      level = 3;
    } else if (state.history.length >= 150) {
      level = 2;
    } else if (state.history.length >= 50) {
      level = 1;
    }
    return level;
  },
};

export const achievements: Achievement[] = [LongRunner];
