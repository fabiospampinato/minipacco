
/* IMPORT */

import {getGraph, checkCircularDependencies, getGraphBundle, getGraphDot} from './utils';

/* MAIN */

const MiniPacco = {

  /* API */

  bundle: ( entryPath: string ): string => {

    const graph = getGraph ( entryPath );

    checkCircularDependencies ( graph );

    const bundle = getGraphBundle ( graph );

    return bundle;

  },

  graph: ( entryPath: string ): string => {

    const graph = getGraph ( entryPath );

    checkCircularDependencies ( graph );

    const dot = getGraphDot ( graph );

    return dot;

  }

};

/* EXPORT */

export default MiniPacco;
