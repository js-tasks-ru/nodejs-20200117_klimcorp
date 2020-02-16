const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = [];

router.get('/subscribe', async (ctx, next) => {
  const addSubscriber = new Promise((res) => {
    subscribers.push(res);
  });

  ctx.body = await addSubscriber;
});

router.post('/publish', async (ctx) => {
  const message = ctx.request.body.message;

  if (!message) {
    ctx.throw(400, 'message is empty');
  }

  subscribers.forEach((resolve) => {
    resolve(message);
  });

  subscribers = [];

  ctx.body = 'ok';
});

app.use(router.routes());

module.exports = app;
