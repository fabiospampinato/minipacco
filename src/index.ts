
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {color} from 'specialist';
import type {Node, Graph} from './types';

/* HELPERS */

const Helpers = {

  /* API */

  checkCircularDependencies: ( graph: Graph ): void => {

    Helpers.traverseGraphFromRoots ( graph, () => {} );

  },

  getFileContent: ( filePath: string ): string => {

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

      process.exit ( 1 );

    }

  },

  getFileDependencies: ( rootPath: string, folderPath: string, fileContent: string ): string[] => {

    const dependencyRe = /@require\s+([^\s;]+)/g;
    const dependenciesMatches = Array.from ( fileContent.matchAll ( dependencyRe ) );
    const dependenciesIdentifiers = dependenciesMatches.map ( match => match[1] );
    const dependenciesAbsolute = dependenciesIdentifiers.map ( dependency => dependency.startsWith ( '.' ) ? path.resolve ( folderPath, dependency ) : path.resolve ( rootPath, dependency ) );

    return dependenciesAbsolute;

  },

  getGraph: ( entryPath: string ): Graph => {

    const filePath = path.resolve ( entryPath );
    const rootPath = path.dirname ( filePath );
    const queue = [filePath];
    const nodes: Graph['nodes'] = {};

     while ( true ) {

      const filePath = queue.shift ();

      if ( !filePath ) break;

      if ( nodes[filePath] ) continue;

      const fileContent = Helpers.getFileContent ( filePath );
      const folderPath = path.dirname ( filePath );
      const dependants: string[] = [];
      const dependencies = Helpers.getFileDependencies ( rootPath, folderPath, fileContent );
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

    graph.leaves = Helpers.getGraphLeaves ( graph );
    graph.roots = Helpers.getGraphRoots ( graph );

    return graph;

  },

  getGraphBundle: ( graph: Graph ): string => {

    const fileContents: string[] = [];

    Helpers.traverseGraphFromLeaves ( graph, node => {

      fileContents.push ( node.fileContent );

    });

    const bundle = fileContents.join ( '\n' );

    return bundle;

  },

  getGraphDot: ( graph: Graph ): string => {

    const lines: string[] = [];

    lines.push ( 'digraph {' );
    lines.push ( 'nodesep=.5' );
    lines.push ( 'node [style="filled",color="gray89"]' );
    lines.push ( 'edge [color="gray43"]' );

    Helpers.traverseGraphFromRoots ( graph, ( parent, child ) => {

      const label = path.relative ( graph.rootPath, child.filePath );

      lines.push ( `"${child.filePath}" [color="${parent ? 'palegreen1' : 'indianred1'}", label="${label}"]` );

      if ( !parent ) return;

      lines.push ( `"${parent.filePath}" -> "${child.filePath}"` );

    });

    lines.push ( '}' );

    const dot = lines.join ( '\n' );

    return dot;

  },

  getGraphLeaves: ( graph: Graph ): Node[] => {

    const leaves = Object.values ( graph.nodes ).filter ( node => !node.dependencies.length );

    return leaves;

  },

  getGraphRoots: ( graph: Graph ): Node[] => {

    const filePaths = new Set ( Object.keys ( graph.nodes ) );

    Object.values ( graph.nodes ).forEach ( node => {

      node.dependencies.forEach ( dependency => {

        filePaths.delete ( dependency );

      });

    });

    const roots = Array.from ( filePaths ).map ( filePath => graph.nodes[filePath] );

    return roots;

  },

  traverseGraphFromLeaves: ( graph: Graph, callback: ( node: Node ) => void ): void => {

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

      process.exit ( 1 );

    }

  },

  traverseGraphFromRoots: ( graph: Graph, callback: (( parent: Node | undefined, child: Node ) => void) ): void => {

    // Calling the callback once per edge, from roots to leaves

    const traversed = new Set<Node> ();

    const traverse = ( traversing: Node[], parent: Node | undefined, child: Node ): void => {

      if ( traversing.includes ( child ) ) {

        const filePaths = [...traversing, child].map ( node => node.filePath );

        console.log ( color.red ( `Circular dependencies detected: ${filePaths.join ( ' -> ' )}` ) );

        process.exit ( 1 );

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

      process.exit ( 1 );

    } else {

      graph.roots.forEach ( root => {

        traverse ( [], undefined, root );

      });

    }

  }

};

/* MAIN */

const MiniPacco = {

  /* API */

  bundle: ( entryPath: string ): string => {

    const graph = Helpers.getGraph ( entryPath );

    Helpers.checkCircularDependencies ( graph );

    const bundle = Helpers.getGraphBundle ( graph );

    return bundle;

  },

  graph: ( entryPath: string ): string => {

    const graph = Helpers.getGraph ( entryPath );

    Helpers.checkCircularDependencies ( graph );

    const dot = Helpers.getGraphDot ( graph );

    return dot;

  }

};

/* EXPORT */

export default MiniPacco;
