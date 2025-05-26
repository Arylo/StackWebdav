import type { Middleware } from "koa";
import useragent from "useragent";

const middleware = (options: { target: 'API' | 'DEVICE' }, mw: Middleware): Middleware => (ctx, next) => {
  const { version, ...uaArgs } = useragent.is(ctx.headers['user-agent'])
  const isAPI = Object.values(uaArgs).some((val) => val)
  if (
    (options.target === 'API' && isAPI) ||
    (options.target === 'DEVICE' && !isAPI)
  ) return mw(ctx, next)
  return next()
}

export default middleware
