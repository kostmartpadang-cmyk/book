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

-- ============================================================
-- Author names: a public "profiles" table (auth.users itself isn't
-- readable by other users). One row per account, auto-created on signup.
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create a profile row (copying the display_name chosen at signup)
-- whenever a new account is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles for accounts created before this table existed.
INSERT INTO public.profiles (id, display_name)
SELECT id, raw_user_meta_data->>'display_name' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Point stories/poems' user_id at profiles(id) instead of auth.users(id)
-- directly, so the API can embed the author's display_name in one query.
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_user_id_fkey;
ALTER TABLE stories ADD CONSTRAINT stories_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE poems DROP CONSTRAINT IF EXISTS poems_user_id_fkey;
ALTER TABLE poems ADD CONSTRAINT poems_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- ============================================================
-- Comments: on poems (whole poem) and on stories (per chapter).
-- Exactly one of poem_id / story_id is set. For a story comment,
-- chapter_id NULL means the story's own built-in first chapter
-- (StoryReader's "main" chapter, which has no row in "chapters"),
-- otherwise it points at a row in "chapters".
-- ============================================================
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT comments_one_target CHECK (
    (poem_id IS NOT NULL AND story_id IS NULL AND chapter_id IS NULL) OR
    (poem_id IS NULL AND story_id IS NOT NULL)
  )
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read comments on visible content" ON comments
  FOR SELECT USING (
    (poem_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM poems WHERE poems.id = comments.poem_id
        AND (poems.is_published = true OR poems.user_id = auth.uid())
    )) OR
    (story_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stories WHERE stories.id = comments.story_id
        AND (stories.is_published = true OR stories.user_id = auth.uid())
    ))
  );

CREATE POLICY "Insert own comment" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own comment or as content owner" ON comments
  FOR DELETE USING (
    auth.uid() = user_id OR
    (poem_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM poems WHERE poems.id = comments.poem_id AND poems.user_id = auth.uid()
    )) OR
    (story_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM stories WHERE stories.id = comments.story_id AND stories.user_id = auth.uid()
    ))
  );
