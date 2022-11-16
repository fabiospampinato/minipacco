# Minipacco

A little bundler for resolving dependencies graphs into a single concatenated file.

## Install

```sh
npm install -g minipacco
```

## Usage

### Overview

This tool reimplements one of the features of the super bloated [pacco](https://github.com/fabiospampinato/pacco).

In some sense it's a tiny language-agnostic bundler, it works like this:

1. It expects an entry-point file, which can be any textual file.
2. It resolves dependencies from that, recursively, building the dependency graph.
3. A dependency on another file is defined by putting a special `@require ./other_file.js` string inside the requiring file, perhaps inside a comment.
4. Each file can depend on any number of other files, it just has to use multiple of those strings.
5. After the dependency graph has been built a single output file will be generated which concatenates all files in the graph in the right order.

The utility of this is pretty niche, but for example this is used in [Cash](https://github.com/fabiospampinato/cash) as it gets rid of all the overhead associated with modules and it also simplifies the codebase since a million imports and exports statements become unnecessary, basically there are no boundaries between modules, because each file is not a module, and that's pretty nice in some cases, like if each little file you have is supposed to extend some object or interface when imported, like it's the case in Cash.

### Bundling

A `bundle` command is provided for bundling, it just accepts an entry file and outputs the concatenated string.

```
minipacco bundle src/index.js
```

### Graphing

A `graph` command is provided for outputting the [`dot`](https://dreampuf.github.io/GraphvizOnline)-encoded dependency graph.

```
minipacco graph src/index.js
```

## License

MIT © Fabio Spampinato
