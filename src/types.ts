
/* MAIN */

type Node = {
  filePath: string,
  fileContent: string,
  dependants: string[],
  dependencies: string[]
};

type Graph = {
  entryPath: string,
  rootPath: string,
  leaves: Node[],
  roots: Node[],
  nodes: Record<string, Node>
};

/* EXPORT */

export type {Node, Graph};
