declare namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly DATABASE_POOL_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  }
}