const shell = require("shelljs");

shell.exec("npm run build:client");
shell.exec("npm run build:server");
shell.rm("-rf", "build");
shell.mkdir("-p", "build");
shell.cp("-r", "./server/dist/*", "./build");
shell.cp("./server/package.json", "./build");
shell.cp("./server/package-lock.json", "./build");
shell.cp("-r", "./client/public", "./build");
