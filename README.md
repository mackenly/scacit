# Scacit
 Minimal markdown based static site generator

 ## About
> Scacit is a minimal static site generator that uses markdown for content and a custom templating engine for layout. Scacit is designed to be simple, fast, and easy to use. It is built with TypeScript and Node.js.
There are lots of markdown supporting static site generators out there, but I wanted to build my own to learn more about the process and to have a tool that I could customize to my liking. Scacit is the result of that effort. Perhaps you too will find its simplicity and flexibility to your liking. The name, Scacit, is static, but with the Ts and C switched.

::: warning
This project is still in development and not ready for production use. API changes are expected.
:::

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Creating Pages / Posts](#creating-pages--posts)
- [Components](#components)
- [Templating](#templating)
- [Template Variables](#template-variables)
- [Template Control Structures](#template-control-structures)
- [CLI](#cli)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features
[x] Broader markdown support
[x] Customizable templating engine
[x] Easy component system
[x] Customizable configuration
[x] Straightforward
[x] Fast static sites
[ ] Image optimization
[ ] Multiple themes
[ ] Plugins
[ ] Commonly used components
[ ] Expanded CLI capabilities
[ ] GitHub Actions integration
[ ] Full documentation
[ ] Extensive testing to ensure stability

### Markdown Support
Scacit used [Markdown It](https://markdown-it.github.io/) to convert markdown to html. It supports all the features of markdown-it with highlight.js for code highlighting, HTML tags, linkify, and typographer.

## Getting Started
For now, clone the repo, and from a project directory run:
```bash
node {PATH_TO_CLONED_REPO}\scacit\dist\cli.js init
```

This will create the necessary files and directories for a new Scacit project.

To preview the site run:
```bash
node {PATH_TO_CLONED_REPO}\scacit\dist\cli.js dev
```

To build the site run:
```bash
node {PATH_TO_CLONED_REPO}\scacit\dist\cli.js build
```

NPX support is coming soon.

## Configuration
Scacit uses a `scacit.config.js` file to configure the site. The default configuration is as follows:
```ts
export default {
    site: {
        title: 'My Scacit Site',
        description: 'Built with Scacit',
        year: new Date().getFullYear(),
        robots: 'noindex, nofollow',
    },
    build: {
        outDir: 'build',
        assets: {
            bundle: true,
            minify: true,
        },
    }
};
```

## Creating Pages / Posts
Pages and posts are created by adding markdown files to the `content` directory. The file name will be the URL path. For example, `content/index.md` is the home page, and `content/hello-world.md` is a post containing markdown examples.

Pages and posts are configured with front matter. Supported front matter is:
```yaml
---
title: Hello World
description: This is a test post
type: Article
tags: test, post
image: /images/test.jpg
---
```

There is not currently support for subdirectories in the `content` directory. This is a planned feature.

## Components
Components are reusable pieces of HTML that can be used in markdown files. Components are stored in the `components` directory. Components are written in HTML. To use a component, use the following syntax where the component name is the file name without the `.html` extension:
```html
{{ component "component-name" }}
```

Props are supported in components. Props are passed as attributes to the component tag. For example:
```html
{{ component "component-name" prop1="value1" prop2="value2" }}
```

## Templating
Scacit uses a custom templating engine. The site layout is stored in the `layout.html` file. The layout file is a standard HTML file with placeholders for the content and components.

A minimal example is as follows:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ post.title }} - {{ site.title }}</title>
  <link rel="stylesheet" href="/styles.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
</head>
<body>
  {{ component "header" }}
  <main>
    {{ content }}
  </main>
  {{ component "footer" }}
  <script src="/scripts.js"></script>
</body>
</html>
```
Notice the use of components for the header and footer. A special `{{ content }}` tag is used to insert the page content. Finally, the `{{ post.title }}` and `{{ site.title }}` are variables that reference the post and site objects. 

Components and variables can be used in the layout file, components, and in markdown files.

## Template Variables
Variables can be accessed by simply using the variable name surrounded by double curly braces. For example, `{{ site.title }}` will output the site title from the configuration file under the `site` object. Since the configuration file is a JavaScript file, any valid JavaScript can be used as a variable and will be evaluated at build time.

## Template Control Structures
Control structures are supported in the templating engine. The supported control structures are:
- `if` statements
- `for` loops

Both are currently buggy and may not work as expected. Loops are especially buggy and may not work at all.

### If Statements
If statements are used to conditionally render content. The syntax is as follows:
```html
{{ if condition }}
  <!-- Content to render if condition is true -->
{{ else }}
  <!-- Content to render if condition is false -->
{{ endif }}
```

### For Loops
For loops are used to iterate over an array of items. The syntax is as follows:
```html
{{ for item in items }}
    <div>
        <h2>{{ item.title }}</h2>
        <p>{{ item.desc }}</p>
    </div>
{{ endfor }}
```

Ideally we should be able to loop over an array of content objects to generate thing like a list of posts, list of tags, or a sitemap. This is a planned feature, though the API may change.

## CLI
The CLI is used to initialize, develop, and build the site. The CLI is run with the following commands:
```bash
node {PATH_TO_CLONED_REPO}\scacit\dist\cli.js init [template]
node {PATH_TO_CLONED_REPO}\scacit\dist\cli.js dev
node {PATH_TO_CLONED_REPO}\scacit\dist\cli.js build
```

The `init` command initializes a new Scacit project. The optional `template` argument is the name of a template to use. Templates are stored in the `templates` directory. The default template is `default`. There are currently no other templates available, but this is a planned feature.

The `dev` command starts a development server that watches for changes to the `content`, `components`, `layout`, and `styles` directories along with the `layout.html` and `scacit.config.ts` files. When changes are detected, the site is rebuilt. The browser window does not currently refresh, however that's a planned feature. The development server runs on `http://localhost:3000`. The port is currently not configurable, but that's a planned feature.

The `build` command builds the site for production. The site is built to the `build` directory. The `build` directory is configurable in the `scacit.config.ts` file.

## Contributing
Contributions are welcome. Please open an issue to discuss major changes or features. For minor changes, open a pull request and I'll review it as soon as possible.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Support
If you find this project useful, consider supporting it by sponsoring [@mackenly](https://github.com/mackenly) on Github: https://github.com/sponsors/mackenly Much appreciated!