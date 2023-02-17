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
    const bundle = MiniPacco.bundle ( entryPaths[0] );
    console.log ( bundle );
  })
  /* GRAPH */
  .command ( 'graph', 'Graph a project into a dot chart' )
  .argument ( '<entryFile>', 'The entrypoint file to start resolving dependencies from' )
  .action ( ( options, entryPaths ) => {
    const graph = MiniPacco.graph ( entryPaths[0] );
    console.log ( graph );
  })
  /* RUN */
  .run ();
