This directory placement is a hack for a server build to look as i want. Origianal placement was in the root directory like so:

> /client
> /server
> /shared
> ...

which caused server build to look like:

```
build
└───shared
│   |   index.js
│   |   ...
│
│
└───server
    └───src
        |   app.js
        |   config.js
        |   ...
```

this was not acceptable for file structure that my hosting provider uses and i couldnt configure TS to customize output directory structure
