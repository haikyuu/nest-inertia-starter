import { NestFactory } from '@nestjs/core';
import { createServer } from 'vite';
import * as session from 'express-session';
import * as FileStoreC from 'session-file-store';
import { expressFlash, inertiaExpressAdapter } from 'inertia-node-adapter';

import { AppModule } from './app.module';
import { html, version } from './utils/inertia';

const FileStore = FileStoreC(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // create vite dev server in middleware mode
  // so vite creates the hmr websocket server on its own.
  // the ws server will be listening at port 24678 by default, and can be
  // configured via server.hmr.port
  const viteServer = await createServer({
    server: {
      middlewareMode: true,
    },
  });

  // use vite's connect instance as middleware
  app.use(viteServer.middlewares);
  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
      store: new FileStore({}),
    }),
  );
  app.use(expressFlash({ initialize: ['success', 'error'] }));
  app.use(
    inertiaExpressAdapter({
      version,
      flashMessages: (req) => req.flash.flashAll(),
      html,
    }),
  );

  await app.listen(3000);
}
bootstrap();
