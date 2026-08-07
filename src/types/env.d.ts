declare namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly DATABASE_POOL_URL: string;
    readonly BETTER_AUTH_SECRET: string;
    readonly BETTER_AUTH_URL: string;
    readonly RESEND_API_KEY: string;
    readonly SUPABASE_URL: string;
    readonly SUPABASE_SERVICE_ROLE_KEY: string;
  }
}
