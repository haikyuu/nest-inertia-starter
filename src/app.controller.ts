import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Inertia } from './decorators/inertia.decorator';
import { InertiaT } from './utils/inertia';
import { Response } from 'express';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// import Template from './view/template.marko';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Template = require('./view/template.marko').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const template = require('marko').load(
//   require.resolve('./view/template.marko'),
// );

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
  @Get('/marko')
  renderMarko(@Res({ passthrough: false }) res: Response) {
    res.marko(Template, { hello: 'world' });
  }
}
