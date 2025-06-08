# backend/clear_spots.py

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clear_spots():
    print("🗑️ Deleting all spots...")
    try:
        # Use a safe WHERE clause (required by Supabase)
        supabase.table("spots").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print("✅ All spots deleted.")
    except Exception as e:
        print(f"❌ Error deleting spots: {e}")

if __name__ == "__main__":
    clear_spots()
