import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Inertia } from './decorators/inertia.decorator';
import { InertiaT } from './utils/inertia';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  async getHello(@Inertia() inertia: InertiaT) {
    await inertia.render({
      component: 'Login',
      props: { test: 1 },
    });
  }
}
