# svelte-devicons

svelte components for the svg icons of the
[devicon](https://github.com/devicons/devicon) project.

## Installation

```js
yarn add svelte-devicons
// OR
npm i svelte-devicons
// OR
pnpm i svelte-devicons
```

## Usage

```tsx
import SvelteOriginalIcon from "svelte-devicons/svelte/original";
// or (not recommended, this would increase bundle size by a lot)
import { GithubOriginalIcon, GithubOriginalWordmarkIcon } from "svelte-devicons";

<GithubOriginalWordmarkIcon />
<GithubOriginalIcon size="2em" />
<SvelteOriginalIcon className="my-class" />
```

### With color

Icons that are only one color can be recolored like this

```tsx
import DeviconPlainIcon from "svelte-devicons/devicon/plain";

<DeviconPlainIcon color="white" />;
```
