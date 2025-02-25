import pkg from 'pg';

const { Pool } = pkg;

export const pool = new Pool({
    connectionString: "postgresql://postgres.qcrozwyackutepuqqwji:Diosdela23$@aws-0-us-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false },
});
