import { Middleware } from "koa";
import StorageManager from "../../storage/StorageManager";
import { fail } from "./utils";

const PUT: Middleware = async (ctx, next) => {
  let data!: Buffer
  try {
    data = await new Promise<Buffer>((resolve, reject) => {
      let chunks: any[] = [];
      ctx.req.on('data', chunk => chunks.push(chunk))
      ctx.req.on('end', () => resolve(Buffer.concat(chunks)))
      ctx.req.on('error', err => reject(err))
    });
  } catch (error) {
    console.error(error)
    return fail(ctx)
  }
  const result = await StorageManager.PUT(ctx.url, data);
  ctx.status = result.statusCode
}

export default PUT
