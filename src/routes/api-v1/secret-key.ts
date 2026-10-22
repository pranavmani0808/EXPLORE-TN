// src/routes/api-v1/secret-key.ts
import { secretKeyHandler } from "@/lib/security/secret-key-route"

export async function POST(request: Request) {
  return secretKeyHandler(request)
}
