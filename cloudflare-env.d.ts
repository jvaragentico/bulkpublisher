declare namespace Cloudflare {
  interface Env {
    ADMIN_PASSWORD?: string;
    LOCAL_ADMIN?: string;
    TELEGRAPH_TOKEN?: string;
    TELEGRAPH_TOKEN_2?: string;
    TELEGRAPH_TOKEN_3?: string;
    TELEGRAPH_TOKEN_4?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
