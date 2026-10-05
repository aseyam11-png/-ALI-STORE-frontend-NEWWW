# Visual regression strategy

## Chromatic

Use after Storybook is initialized. Stories should represent important ALI STORE states:

- product card: default / discount / out-of-stock
- product details: variant selected / unavailable
- cart drawer: empty / populated
- checkout: validation error / loading / success
- auth: login / register / verification
- search: suggestions / no results / AI discovery
- responsive navigation: desktop / mobile

Chromatic is the preferred component-state visual regression layer.

## BackstopJS

Use for page-level snapshots where a story is not the right abstraction. The repository includes backstop.config.cjs.

Do not enable Backstop as a blocking regression gate until reference screenshots have been reviewed and committed. A reference generated from the same build being tested provides no regression confidence.
