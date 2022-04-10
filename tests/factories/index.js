import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";

const factoriesArray = loadFilesSync(path.join(__dirname, "."), {
  ignoreIndex: true,
  extensions: ["js"],
});

const FactoryBot = {};

factoriesArray.forEach((factory) => {
  console.log(factory);
});

export default FactoryBot;
