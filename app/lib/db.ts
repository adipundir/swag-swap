import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Listing {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  category: string;
  seller: string;
  created_at: string;
}

export { sql };

