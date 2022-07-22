import degit from "degit";
import fs from "fs";
import fsAsync from "fs/promises";
import { JSDOM } from "jsdom";

interface ConfigEntry {
  name: string;
  tags: string[];
  versions: {
    svg: string[];
    font: string[];
  };
  color: string;
  aliases: {
    base: string;
    alias: string;
  }[];
}

(async () => {
  const index: [string, string][] = [];

  if (fs.existsSync(`${__dirname}/tmp`))
    fs.rmSync(`${__dirname}/tmp`, { recursive: true });
  if (fs.existsSync(`${__dirname}/dist`))
    fs.rmSync(`${__dirname}/dist`, { recursive: true });
  fsAsync.mkdir(`${__dirname}/tmp`);

  await degit("snailedlt/devicon#feature/convert_style_elements_to_attributes").clone(
    `${__dirname}/tmp/devicon`
  );

  const deviconConfig: ConfigEntry[] = JSON.parse(
    (await fsAsync.readFile(`${__dirname}/tmp/devicon/devicon.json`)).toString()
  );

  await fsAsync.mkdir(`${__dirname}/tmp/dist`);
  await fsAsync.copyFile(
    `${__dirname}/readme.md`,
    `${__dirname}/tmp/dist/readme.md`
  );
  await fsAsync.copyFile(
    `${__dirname}/package.json`,
    `${__dirname}/tmp/dist/package.json`
  );

  await Promise.all(
    deviconConfig.map(async (entry) => {
      await fsAsync.mkdir(`${__dirname}/tmp/dist/${entry.name}`);
      await Promise.all(
        entry.versions.svg.map(async (version) => {
          const name = `${entry.name}-${version}`;
          const icon = await fsAsync.readFile(
            `${__dirname}/tmp/devicon/icons/${entry.name}/${name}.svg`
          );
          const { document } = new JSDOM(icon).window;
          const dir = `${__dirname}/tmp/dist/${entry.name}/${version}`;
          const svelteName =
            name
              .split("-")
              .map((el) => el.charAt(0).toUpperCase() + el.slice(1))
              .join("") + "Icon";
          index.push([svelteName, `./${entry.name}/${version}`]);
          await fsAsync.mkdir(dir);
          const svg = document.getElementsByTagName("svg")[0];
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.removeAttribute("xmlns:xlink");
          const isPlain =
            version.includes("plain") ||
            version.includes("line") ||
            !!entry.aliases.find(
              (x) =>
                x.base == version &&
                (x.alias.includes("plain") || x.alias.includes("line"))
            );
          if (isPlain) {
            svg.removeAttribute("fill");
            const elements = svg.getElementsByTagName("*");
            for (let i = 0; i < elements.length; i++) {
              const element = elements[i] as SVGElement;
              element.removeAttribute("fill");
              element.setAttribute("fill", "{color}")
              element.style.removeProperty("fill");
              element.style.removeProperty("fill-rule");
              element.style.removeProperty("fill-opacity");
            }
          }
          await fsAsync.writeFile(
            `${dir}/${svelteName}.svelte`,
            `<script>
  ${isPlain ? "export let color;" : ""} 
</script>
${svg.outerHTML}`
          );
        })
      );
    })
  );

  await fsAsync.writeFile(
    `${__dirname}/tmp/dist/index.js`,
    index.map((e) => `const ${e[0]} = require("${e[1]}")`).join(";\n") +
      ";\n" +
      `module.exports = {${index.map((e) => e[0]).join(",")}}`
  );
  await fsAsync.writeFile(
    `${__dirname}/tmp/dist/index.d.ts`,
    index.map((e) => `export { default as ${e[0]} } from "${e[1]}"`).join(";\n")
  );
})();
