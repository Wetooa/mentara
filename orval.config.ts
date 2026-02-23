import { defineConfig } from 'orval';

export default defineConfig({
  'api-client': {
    output: {
      mode: 'tags-split',
      target: 'libs/api-client/src/generated/api.ts',
      schemas: 'libs/api-client/src/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      override: {

        mutator: {
          path: './libs/api-client/src/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: 'http://127.0.0.1:3001/api/docs-json',
    },

  },
});
