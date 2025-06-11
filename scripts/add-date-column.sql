-- transactionsテーブルにdateカラムを追加するSQL
-- Supabaseダッシュボード > SQL Editor で実行してください

-- 1. dateカラムを追加
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date DATE;

-- 2. 既存のレコードのdateカラムにcreated_atの日付部分を設定
UPDATE transactions SET date = DATE(created_at) WHERE date IS NULL;

-- 3. dateカラムを必須にする
ALTER TABLE transactions ALTER COLUMN date SET NOT NULL;

-- 4. dateカラムにインデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by_date ON transactions(created_by, date);

-- 確認用クエリ
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
