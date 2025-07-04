// データベーススキーマ確認・更新スクリプト
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://siqosvnljerqsbylozqp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcW9zdm5samVycXNieWxvenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjk3ODcsImV4cCI6MjA2NDYwNTc4N30.JXWUqTtB8oJfKwnLk1b8bqpsKub2iuXUmUnGkKu1HLA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTransactionsTable() {
  try {
    console.log("Checking transactions table...");

    // まず、テーブルの存在を確認
    const { data: existingData, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .limit(1);

    if (fetchError) {
      console.error("Error accessing transactions table:", fetchError);
      return;
    }

    console.log("Transactions table exists");

    // dateカラムの存在確認
    if (existingData && existingData.length > 0) {
      const columns = Object.keys(existingData[0]);
      console.log("Current columns:", columns);

      if (columns.includes("date")) {
        console.log("✅ Date column already exists");
        return;
      }
    }

    console.log("❌ Date column does not exist");
    console.log(
      "Note: Column addition requires admin privileges or SQL execution in Supabase dashboard",
    );
    console.log("Please add the following SQL in your Supabase SQL Editor:");
    console.log("");
    console.log("-- Add date column to transactions table");
    console.log("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date DATE;");
    console.log("");
    console.log("-- Update existing records to use created_at date");
    console.log(
      "UPDATE transactions SET date = DATE(created_at) WHERE date IS NULL;",
    );
    console.log("");
    console.log("-- Make date column required");
    console.log("ALTER TABLE transactions ALTER COLUMN date SET NOT NULL;");
  } catch (error) {
    console.error("Error:", error);
  }
}

updateTransactionsTable();
