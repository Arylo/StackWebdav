import type { Middleware } from "koa";
import useragent from "useragent";

export enum UATarget {
  BROWSER = 'BROWSER',
  DEVICE = 'DEVICE',
}

const middleware = (options: { target: UATarget }, mw: Middleware): Middleware => (ctx, next) => {
  let { uaTarget } = ctx.state as { uaTarget?: UATarget };
  if (!uaTarget) {
    const { version, ...uaArgs } = useragent.is(ctx.headers['user-agent'])
    const isBrowser = Object.values(uaArgs).some((val) => val)
    uaTarget = isBrowser ? UATarget.BROWSER : UATarget.DEVICE
    ctx.state.uaTarget = uaTarget
  }
  if (options.target === uaTarget) return mw(ctx, next)
  return next()
}

export default middleware
