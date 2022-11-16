
/* IMPORT */

import fs from 'node:fs';
import path from 'node:path';
import type {Node, Graph} from './types';

/* HELPERS */

const Helpers = {

  /* API */

  getDependencies: ( rootPath: string, folderPath: string, fileContent: string ): string[] => {

    const dependencyRe = /@require\s+([^\s;]+)/g;
    const dependenciesMatches = Array.from ( fileContent.matchAll ( dependencyRe ) );
    const dependencies = dependenciesMatches.map ( match => match[1] );
    const dependenciesAbsolute = dependencies.map ( dependency => dependency.startsWith ( '.' ) ? path.resolve ( folderPath, dependency ) : path.resolve ( rootPath, dependency ) );

    return dependenciesAbsolute;

  },

  getRoots: ( nodes: Graph['nodes'] ): Node[] => {

    const filePaths = new Set ( Object.keys ( nodes ) );

    Object.values ( nodes ).forEach ( node => {

      node.dependencies.forEach ( dependency => {

        filePaths.delete ( dependency );

      });

    });

    const roots = Array.from ( filePaths ).map ( path => nodes[path] );

    return roots;

  }

};

/* MAIN */

const MiniPacco = {

  /* API */

  bundle: ( entryPath: string ): string => {

    const graph = MiniPacco.resolve ( entryPath );
    const fileContents: string[] = [];

    MiniPacco.traverse ( graph, ( _, child ) => {

      fileContents.push ( child.fileContent );

    });

    const bundle = fileContents.join ( '\n' );

    return bundle;

  },

  graph: ( entryPath: string ): string => {

    const graph = MiniPacco.resolve ( entryPath );
    const lines: string[] = [];

    lines.push ( 'digraph {' );
    lines.push ( 'nodesep=.5' );
    lines.push ( 'node [style="filled",color="gray89"]' );
    lines.push ( 'edge [color="gray43"]' );

    MiniPacco.traverse ( graph, ( parent, child ) => {

      const label = path.relative ( graph.rootPath, child.filePath );

      lines.push ( `"${child.filePath}" [color="${parent ? 'palegreen1' : 'indianred1'}", label="${label}"]` );

      if ( !parent ) return;

      lines.push ( `"${parent.filePath}" -> "${child.filePath}"` );

    });

    lines.push ( '}' );

    const dot = lines.join ( '\n' );

    return dot;

  },

  resolve: ( entryPath: string ): Graph => {

    const filePath = path.resolve ( entryPath );
    const rootPath = path.dirname ( filePath );
    const queue = [filePath];
    const nodes: Graph['nodes'] = {};

     while ( true ) {

      const filePath = queue.shift ();

      if ( !filePath ) break;

      if ( nodes[filePath] ) continue;

      const fileContent = fs.readFileSync ( filePath, 'utf8' );
      const folderPath = path.dirname ( filePath );
      const dependencies = Helpers.getDependencies ( rootPath, folderPath, fileContent );
      const node: Node = { filePath, fileContent, dependencies };

      nodes[filePath] = node;
      queue.unshift ( ...dependencies );

    }

    const roots = Helpers.getRoots ( nodes );
    const graph: Graph = { entryPath, rootPath, roots, nodes };

    return graph;

  },

  traverse: ( graph: Graph, callback: (( parent: Node | undefined, child: Node ) => void) ): void => {

    const traversed = new Set<string> ();

    const traverse = ( traversing: string[], parent: Node | undefined, child: Node ): void => {

      if ( traversing.includes ( child.filePath ) ) {

        throw new Error ( `Circular dependencies detected: ${[...traversing, child.filePath].join ( ' -> ' )}` );

      }

      traversing = [...traversing, child.filePath];

      if ( traversed.has ( child.filePath ) ) return;

      traversed.add ( child.filePath );

      callback ( parent, child );

      child.dependencies.forEach ( dependency => {

        traverse ( traversing, child, graph.nodes[dependency] );

      });

    };

    if ( !graph.roots.length ) {

      throw new Error ( 'Circular dependencies detected, no root nodes found' );

    }

    graph.roots.forEach ( root => {

      traverse ( [], undefined, root );

    });

  }

};

/* EXPORT */

export default MiniPacco;
