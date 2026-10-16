declare namespace Cloudflare {
  interface Env {
    ADMIN_PASSWORD?: string;
    LOCAL_ADMIN?: string;
    TELEGRAPH_TOKEN?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
