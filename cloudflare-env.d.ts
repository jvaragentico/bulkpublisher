declare namespace Cloudflare {
  interface Env {
    ADMIN_PASSWORD?: string;
    LOCAL_ADMIN?: string;
    TELEGRAPH_TOKEN?: string;
    TELEGRAPH_TOKEN_2?: string;
    TELEGRAPH_TOKEN_3?: string;
    TELEGRAPH_TOKEN_4?: string;
    DEV_TOKEN?: string;
    WORDPRESS_TOKEN?: string;
    WORDPRESS_SITE_ID?: string;
    BLOGGER_TOKEN?: string;
    BLOGGER_BLOG_ID?: string;
    TUMBLR_TOKEN?: string;
    TUMBLR_BLOG_NAME?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_UNSIGNED_PRESET?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
