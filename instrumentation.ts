export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runMigrations } = await import('./app/lib/db/migrate');
    await runMigrations();
  }
}
