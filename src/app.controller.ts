import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
</head>

<body>
    <div id="app"></div>
</body>
<script type="module" src="/@vite/client"></script>
<script type="module" src="/main.tsx"></script>
</body>

</html>
    `;
  }
}
