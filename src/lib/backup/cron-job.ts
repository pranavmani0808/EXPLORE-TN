// This script runs the nightly backup on Vercel via the /api/v1/cron/db-backup endpoint.
// It uses the pg_dump utility to export the database, compresses it, and uploads the result
// to the object storage bucket configured by BACKUP_BUCKET_URL.
// The script assumes environment variables are set in Vercel's environment.

import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import fetch from "node-fetch"

const dbUrl = process.env.SUPABASE_URL!
const dbUser = process.env.SUPABASE_DB_USER!
const dbPass = process.env.SUPABASE_DB_PASSWORD!
const dbName = process.env.SUPABASE_DB_NAME!
const backupBucket = process.env.BACKUP_BUCKET_URL!

export async function handler() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filename = `${dbName}-${timestamp}.sql.gz`
  const tmpPath = path.join("/tmp", filename)

  // Dump and gzip
  const dumpCmd = `PGPASSWORD=${dbPass} pg_dump -h ${dbUrl} -U ${dbUser} ${dbName} | gzip > ${tmpPath}`
  execSync(dumpCmd, { stdio: "inherit" })

  // Upload to bucket (assuming signed URL or simple PUT works)
  const uploadUrl = `${backupBucket}/${filename}`
  const file = fs.readFileSync(tmpPath)
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/gzip" },
    body: file,
  })

  // Optionally clean up the temp file
  fs.unlinkSync(tmpPath)
  return { status: 200, body: JSON.stringify({ message: "Backup complete", file: filename }) }
}
