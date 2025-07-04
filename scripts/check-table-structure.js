// テーブル構造確認スクリプト
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://siqosvnljerqsbylozqp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcW9zdm5samVycXNieWxvenFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjk3ODcsImV4cCI6MjA2NDYwNTc4N30.JXWUqTtB8oJfKwnLk1b8bqpsKub2iuXUmUnGkKu1HLA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    // transactionsテーブルのサンプルデータを取得してカラム構造を確認
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error fetching transactions:", error);
      return;
    }

    if (data && data.length > 0) {
      console.log("Transactions table columns:");
      console.log(Object.keys(data[0]));
      console.log("\nSample data:");
      console.log(data[0]);
    } else {
      console.log("No data found in transactions table");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkTableStructure();
