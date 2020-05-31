type colors = {
  primary: string;
  secondary: string;
  error: string;
};
interface theme {
  colors: colors;
}

export const darkTheme: theme = {
  colors: {
    primary: "#2b2b2b",
    secondary: "#b2b2b2",
    error: "#c44569",
  },
};

export const lightTheme: theme = {
  colors: {
    primary: "#b2b2b2",
    secondary: "#2b2b2b",
    error: "#c44569",
  },
};
