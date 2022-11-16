
/* MAIN */

type Node = {
  filePath: string,
  fileContent: string,
  dependencies: string[]
};

type Graph = {
  entryPath: string,
  rootPath: string,
  roots: Node[],
  nodes: Record<string, Node>
};

/* EXPORT */

export type {Node, Graph};
