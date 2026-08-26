-- Run this query in your Supabase SQL Editor to create the stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow public access for this demo
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON stories
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON stories
  FOR INSERT WITH CHECK (true);
