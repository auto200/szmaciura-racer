import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
      colors:{
        primary: string;
        secondary: string;
        error: string;
        success: string;
        golden: string;
      }
  }
}

//https://www.frontlive.pl/typescript-react/#styled-components