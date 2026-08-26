-- Run this query in your Supabase SQL Editor to create the stories table
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'soft',
  cover_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Anyone can read published stories; authors can also read their own drafts.
CREATE POLICY "Read published or own" ON stories
  FOR SELECT USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Insert own" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

-- Lets any signed-in user claim ownership of a story that has no owner yet
-- (e.g. one created before accounts existed). Only applies while user_id is
-- still NULL, and only allows setting it to yourself.
CREATE POLICY "Claim ownerless story" ON stories
  FOR UPDATE USING (user_id IS NULL) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own" ON stories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- If the "stories" table already exists from before (no auth/publish yet),
-- run this migration instead of the CREATE TABLE above:
-- ============================================================
-- ALTER TABLE stories ADD COLUMN theme TEXT NOT NULL DEFAULT 'soft';
-- ALTER TABLE stories ADD COLUMN cover_url TEXT;
-- ALTER TABLE stories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
-- ALTER TABLE stories ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
-- ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "Allow public read" ON stories;
-- DROP POLICY IF EXISTS "Allow public insert" ON stories;
-- DROP POLICY IF EXISTS "Allow public update" ON stories;
-- DROP POLICY IF EXISTS "Allow public delete" ON stories;
--
-- CREATE POLICY "Read published or own" ON stories FOR SELECT USING (is_published = true OR user_id = auth.uid());
-- CREATE POLICY "Insert own" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Update own" ON stories FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Delete own" ON stories FOR DELETE USING (auth.uid() = user_id);
--
-- Note: stories created before this migration have no user_id (unowned).
-- They stay publicly readable (is_published defaults to true) but nobody
-- can edit/delete them anymore since there's no matching owner.

-- Chapters: extra chapters beyond the story's own built-in first chapter
-- (stories.title/content act as "Chapter 1").
CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number INT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read chapters of visible stories" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
        AND (stories.is_published = true OR stories.user_id = auth.uid())
    )
  );

CREATE POLICY "Insert chapters of own stories" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
  );

CREATE POLICY "Update chapters of own stories" ON chapters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
  );

CREATE POLICY "Delete chapters of own stories" ON chapters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
  );

-- If the "chapters" table already exists from before with the old public
-- policies, run this instead:
-- DROP POLICY IF EXISTS "Allow public read" ON chapters;
-- DROP POLICY IF EXISTS "Allow public insert" ON chapters;
-- DROP POLICY IF EXISTS "Allow public update" ON chapters;
-- DROP POLICY IF EXISTS "Allow public delete" ON chapters;
--
-- CREATE POLICY "Read chapters of visible stories" ON chapters FOR SELECT USING (
--   EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND (stories.is_published = true OR stories.user_id = auth.uid()))
-- );
-- CREATE POLICY "Insert chapters of own stories" ON chapters FOR INSERT WITH CHECK (
--   EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
-- );
-- CREATE POLICY "Update chapters of own stories" ON chapters FOR UPDATE USING (
--   EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
-- );
-- CREATE POLICY "Delete chapters of own stories" ON chapters FOR DELETE USING (
--   EXISTS (SELECT 1 FROM stories WHERE stories.id = chapters.story_id AND stories.user_id = auth.uid())
-- );

-- Poems: a separate content type from stories. Either "content" (written text)
-- or "image_url" (uploaded poem image) should be set — the app enforces this,
-- not the database.
CREATE TABLE poems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  theme TEXT NOT NULL DEFAULT 'soft',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read published or own" ON poems
  FOR SELECT USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Insert own" ON poems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own" ON poems
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Claim ownerless poem" ON poems
  FOR UPDATE USING (user_id IS NULL) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own" ON poems
  FOR DELETE USING (auth.uid() = user_id);
