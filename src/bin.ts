#!/usr/bin/env node

/* IMPORT */

import process from 'node:process';
import {program, updater} from 'specialist';
import MiniPacco from '.';

/* HELPERS */

const name = 'minipacco';
const description = 'A little bundler for resolving dependencies graphs into a single concatenated file.';
const version = '1.0.0';

/* MAIN */

updater ({ name, version });

program
  .name ( name )
  .version ( version )
  .description ( description );

program
  .command ( 'bundle' )
  .description ( 'Bundle a project into a file' )
  .arguments ( '<entryFile>' )
  .action ( async entryPath => {
    const bundle = await MiniPacco.bundle ( entryPath );
    console.log ( bundle );
    process.exit ( 0 );
  });

program
  .command ( 'graph' )
  .description ( 'Graph a project into a dot chart' )
  .arguments ( '<entryFile>' )
  .action ( async entryPath => {
    const graph = await MiniPacco.graph ( entryPath );
    console.log ( graph );
    process.exit ( 0 );
  });

program.parse ();
