#!/usr/bin/env node

/* IMPORT */

import {bin} from 'specialist';
import MiniPacco from '.';

/* MAIN */

bin ( 'minipacco', 'A little bundler for resolving dependencies graphs into a single concatenated file.' )
  /* BUNDLE */
  .command ( 'bundle', 'Bundle a project into a file' )
  .argument ( '<entryFile>', 'The entrypoint file to start resolving dependencies from' )
  .action ( ( options, entryPaths ) => {
    try {
      const bundle = MiniPacco.bundle ( entryPaths[0] );
      console.log ( bundle );
    } catch {
      process.exit ( 1 );
    }
  })
  /* GRAPH */
  .command ( 'graph', 'Graph a project into a dot chart' )
  .argument ( '<entryFile>', 'The entrypoint file to start resolving dependencies from' )
  .action ( ( options, entryPaths ) => {
    try {
      const graph = MiniPacco.graph ( entryPaths[0] );
      console.log ( graph );
    } catch {
      process.exit ( 1 );
    }
  })
  /* RUN */
  .run ();
