import 'vite/dynamic-import-polyfill';
import { InertiaApp } from '@inertiajs/inertia-react';
import React from 'react';
import { render } from 'react-dom';

const el = document.getElementById('app');

render(
  <InertiaApp
    initialPage={{ component: 'Login', props: {}, url: '/', version: 1 }}
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    resolveComponent={(name) =>
      import(`./Pages/${name}.tsx`).then((module) => module.default)
    }
  />,
  el,
);
