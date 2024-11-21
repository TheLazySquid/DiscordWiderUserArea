import typescript from "@rollup/plugin-typescript";
import { string } from "rollup-plugin-string";
import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync("./package.json"));

export default {
  input: "src/main.ts",
  meta: {
    name: "WiderUserArea",
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    authorId: "619261917352951815",
    website: pkg.repository.url,
    source: pkg.repository.url + "/blob/main/build/WiderUserArea.plugin.js",
  },
  plugins: [
    typescript({
      compilerOptions: {
        target: "es2022"
      }
    }),
    string({
      include: "**/*.css"
    })
  ]
}