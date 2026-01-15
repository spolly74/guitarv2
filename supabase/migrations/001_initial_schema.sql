-- Guitar Practice App v2 - Initial Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Lesson',
  ui_schema JSONB NOT NULL DEFAULT '{"lessonId":"","layout":{"order":[],"pinned":[]},"blocks":{}}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table (stores message history per lesson)
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL UNIQUE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lessons_user_id ON public.lessons(user_id);
CREATE INDEX idx_lessons_updated_at ON public.lessons(updated_at DESC);
CREATE INDEX idx_chats_lesson_id ON public.chats(lesson_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Lessons RLS Policies
CREATE POLICY "Users can view own lessons"
  ON public.lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lessons"
  ON public.lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lessons"
  ON public.lessons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lessons"
  ON public.lessons FOR DELETE
  USING (auth.uid() = user_id);

-- Chats RLS Policies
CREATE POLICY "Users can view own lesson chats"
  ON public.chats FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lessons
    WHERE lessons.id = chats.lesson_id
    AND lessons.user_id = auth.uid()
  ));

CREATE POLICY "Users can create chats for own lessons"
  ON public.chats FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.lessons
    WHERE lessons.id = chats.lesson_id
    AND lessons.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own lesson chats"
  ON public.chats FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.lessons
    WHERE lessons.id = chats.lesson_id
    AND lessons.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own lesson chats"
  ON public.chats FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.lessons
    WHERE lessons.id = chats.lesson_id
    AND lessons.user_id = auth.uid()
  ));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
