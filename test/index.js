
/* IMPORT */

import fs from 'node:fs';
import {describe} from 'fava';
import MiniPacco from '../dist/index.js';

/* MAIN */

describe ( 'MiniPacco', () => {

  describe ( 'bundle', it => {

    it ( 'can detect inner circular dependencies', t => {

      try {

        MiniPacco.bundle ( 'test/fixtures/source/circular_inner/a.js' );

      } catch ( error ) {

        t.is ( error.message, 'Inner circular dependency found' );

      }

    });

    it ( 'can detect outer circular dependencies', t => {

      try {

        MiniPacco.bundle ( 'test/fixtures/source/circular_outer/a.js' );

      } catch ( error ) {

        t.is ( error.message, 'Outer circular dependency found' );

      }

    });

    it ( 'can bundle the css package', t => {

      const result = MiniPacco.bundle ( 'test/fixtures/source/css/a.css' );
      const expected = fs.readFileSync ( 'test/fixtures/bundle_expected/css/bundle.css', 'utf8' );

      t.is ( result.trim (), expected.trim () );

    });

    it ( 'can bundle the js package', t => {

      const result = MiniPacco.bundle ( 'test/fixtures/source/js/a.js' );
      const expected = fs.readFileSync ( 'test/fixtures/bundle_expected/js/bundle.js', 'utf8' );

      t.is ( result.trim (), expected.trim () );

    });

  });

  describe ( 'graph', it => {

    it ( 'can graph the css package', t => {

      const result = MiniPacco.graph ( 'test/fixtures/source/css/a.css' );
      const expected = fs.readFileSync ( 'test/fixtures/graph_expected/css/graph.dot', 'utf8' );

      t.is ( result.trim (), expected.trim () );

    });

    it ( 'can graph the js package', t => {

      const result = MiniPacco.graph ( 'test/fixtures/source/js/a.js' );
      const expected = fs.readFileSync ( 'test/fixtures/graph_expected/js/graph.dot', 'utf8' );

      t.is ( result.trim (), expected.trim () );

    });

  });

});
