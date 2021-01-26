import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'vite';

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
  await app.listen(3000);
}
bootstrap();
