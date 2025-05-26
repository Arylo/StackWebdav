import { Middleware } from "koa";
import StorageManager, { STATUS_MESSAGE } from "../../storage/StorageManager";
import Status from 'http-status';
import { nonStorage } from "./utils";

const PUT: Middleware = async (ctx, next) => {
  const data = await new Promise<Buffer>((resolve, reject) => {
    let chunks: any[] = [];
    ctx.req.on('data', chunk => chunks.push(chunk))
    ctx.req.on('end', () => resolve(Buffer.concat(chunks)))
    ctx.req.on('error', err => reject(err))
  });
  const [status] = await StorageManager.PUT(ctx.url, data);
  if (status === STATUS_MESSAGE.NOT_STORAGE) return nonStorage(ctx)
  if (status === STATUS_MESSAGE.CREATED) {
    ctx.status = Status.CREATED
    return
  }
  ctx.status = Status.OK
}

export default PUT
