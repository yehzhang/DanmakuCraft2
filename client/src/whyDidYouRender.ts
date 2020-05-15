import * as React from 'react';
import * as ReactRedux from 'react-redux';

async function whyDidYouRender() {
  const { default: whyDidYouRender_ } = await import('@welldone-software/why-did-you-render');

  whyDidYouRender_(React, {
    trackAllPureComponents: true,
    include: [/.*/],
    exclude: [/^ConsoleDisplay/, /^Ticker$/],
    trackExtraHooks: [[ReactRedux, 'useSelector']],
  });
}

export default whyDidYouRender;
