
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import {color} from 'specialist';
import type {Node, Graph} from './types';

/* MAIN */

const checkCircularDependencies = ( graph: Graph ): void => {

  traverseGraphFromRoots ( graph, () => {} );

};

const getFileContent = ( filePath: string ): string => {

  try {

    return fs.readFileSync ( filePath, 'utf8' );

  } catch ( error: unknown ) {

    const isFound = fs.existsSync ( filePath );

    if ( isFound ) {

      console.log ( color.red ( `Failed to read file: "${filePath}"` ) );
      console.log ( error );

    } else {

      console.log ( color.red ( `File not found: "${filePath}"` ) );

    }

    throw new Error ( 'Failed to read file' );

  }

};

const getFileDependencies = ( rootPath: string, folderPath: string, fileContent: string ): string[] => {

  const dependencyRe = /@require\s+([^\s;]+)/g;
  const dependenciesMatches = Array.from ( fileContent.matchAll ( dependencyRe ) );
  const dependenciesIdentifiers = dependenciesMatches.map ( match => match[1] );
  const dependenciesAbsolute = dependenciesIdentifiers.map ( dependency => dependency.startsWith ( '.' ) ? path.resolve ( folderPath, dependency ) : path.resolve ( rootPath, dependency ) );

  return dependenciesAbsolute;

};

const getGraph = ( entryPath: string ): Graph => {

  const filePath = path.resolve ( entryPath );
  const rootPath = path.dirname ( filePath );
  const queue = [filePath];
  const nodes: Graph['nodes'] = {};

    while ( true ) {

    const filePath = queue.shift ();

    if ( !filePath ) break;

    if ( nodes[filePath] ) continue;

    const fileContent = getFileContent ( filePath );
    const folderPath = path.dirname ( filePath );
    const dependants: string[] = [];
    const dependencies = getFileDependencies ( rootPath, folderPath, fileContent );
    const node: Node = { filePath, fileContent, dependants, dependencies };

    nodes[filePath] = node;
    queue.unshift ( ...dependencies );

  }

  Object.values ( nodes ).forEach ( node => {

    node.dependencies.forEach ( dependency => {

      nodes[dependency].dependants.push ( node.filePath );

    });

  });

  const graph: Graph = { entryPath, rootPath, leaves: [], roots: [], nodes };

  graph.leaves = getGraphLeaves ( graph );
  graph.roots = getGraphRoots ( graph );

  return graph;

};

const getGraphBundle = ( graph: Graph ): string => {

  const fileContents: string[] = [];

  traverseGraphFromLeaves ( graph, node => {

    fileContents.push ( node.fileContent );

  });

  const bundle = fileContents.join ( '\n' );

  return bundle;

};

const getGraphDot = ( graph: Graph ): string => {

  const lines: string[] = [];

  lines.push ( 'digraph {' );
  lines.push ( 'nodesep=.5' );
  lines.push ( 'node [style="filled",color="gray89"]' );
  lines.push ( 'edge [color="gray43"]' );

  traverseGraphFromRoots ( graph, ( parent, child ) => {

    const label = path.relative ( graph.rootPath, child.filePath );

    lines.push ( `"${child.filePath}" [color="${parent ? 'palegreen1' : 'indianred1'}", label="${label}"]` );

    if ( !parent ) return;

    lines.push ( `"${parent.filePath}" -> "${child.filePath}"` );

  });

  lines.push ( '}' );

  const dot = lines.join ( '\n' );

  return dot;

};

const getGraphLeaves = ( graph: Graph ): Node[] => {

  const leaves = Object.values ( graph.nodes ).filter ( node => !node.dependencies.length );

  return leaves;

};

const getGraphRoots = ( graph: Graph ): Node[] => {

  const filePaths = new Set ( Object.keys ( graph.nodes ) );

  Object.values ( graph.nodes ).forEach ( node => {

    node.dependencies.forEach ( dependency => {

      filePaths.delete ( dependency );

    });

  });

  const roots = Array.from ( filePaths ).map ( filePath => graph.nodes[filePath] );

  return roots;

};

const traverseGraphFromLeaves = ( graph: Graph, callback: ( node: Node ) => void ): void => {

  // Calling the callback once per node, from leaves to roots

  const traversed = new Set<string> ();

  const traverse = ( node: Node ): void => {

    if ( traversed.has ( node.filePath ) ) return;

    if ( !node.dependencies.every ( dependency => traversed.has ( dependency ) ) ) return;

    callback ( node );

    traversed.add ( node.filePath );

    node.dependants.forEach ( dependant => {

      traverse ( graph.nodes[dependant] );

    });

  };

  graph.leaves.forEach ( leaf => {

    traverse ( leaf );

  });

  if ( traversed.size !== Object.keys ( graph.nodes ).length ) {

    console.log ( color.red ( 'Circular dependencies detected, leftover non-leaves nodes' ) );

    throw new Error ( 'Outer circular dependency found' );

  }

};

const traverseGraphFromRoots = ( graph: Graph, callback: (( parent: Node | undefined, child: Node ) => void) ): void => {

  // Calling the callback once per edge, from roots to leaves

  const traversed = new Set<Node> ();

  const traverse = ( traversing: Node[], parent: Node | undefined, child: Node ): void => {

    if ( traversing.includes ( child ) ) {

      const filePaths = [...traversing, child].map ( node => node.filePath );

      console.log ( color.red ( `Circular dependencies detected: ${filePaths.join ( ' -> ' )}` ) );

      throw new Error ( 'Inner circular dependency found' );

    }

    callback ( parent, child );

    if ( !traversed.has ( child ) ) {

      traversed.add ( child );

      traversing = [...traversing, child];

      child.dependencies.forEach ( dependency => {

        traverse ( traversing, child, graph.nodes[dependency] );

      });

    }

  };

  if ( !graph.roots.length ) {

    console.log ( color.red ( 'Circular dependencies detected, no root files found' ) );

    throw new Error ( 'Outer circular dependency found' );

  } else {

    graph.roots.forEach ( root => {

      traverse ( [], undefined, root );

    });

  }

};

/* EXPORT */

export {checkCircularDependencies, getFileContent, getFileDependencies, getGraph, getGraphBundle, getGraphDot, getGraphLeaves, getGraphRoots, traverseGraphFromLeaves, traverseGraphFromRoots};
