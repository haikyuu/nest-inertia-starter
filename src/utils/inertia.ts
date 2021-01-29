export type props = Record<string | number | symbol, unknown>;

export interface Page {
  component: string;
  props: props;
  url: string;
  version: string;
}
export interface RenderPage {
  component: string;
  props: props;
}
export type InertiaT = {
  readonly setViewData: (viewData: props) => InertiaT;
  readonly shareProps: (sharedProps: props) => InertiaT;
  readonly setStatusCode: (statusCode: number) => InertiaT;
  readonly setHeaders: (headers: Record<string, string>) => InertiaT;
  readonly render: (Page: RenderPage) => Promise<Response>;
  readonly redirect: (url: string) => Response;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function html(page: Page, viewData: props) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite App</title>
</head>

<body>
    <div id="app" data-page='${JSON.stringify(page)}'></div>
</body>
<script type="module" src="/@vite/client"></script>
<script type="module" src="/main.tsx"></script>
</body>

</html>`;
}

export const version = '1';
