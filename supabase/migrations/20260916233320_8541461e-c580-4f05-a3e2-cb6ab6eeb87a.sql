ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS persona text NOT NULL DEFAULT '';

CREATE TABLE public.owner_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.owner_messages TO authenticated;
GRANT ALL ON public.owner_messages TO service_role;

ALTER TABLE public.owner_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages"
  ON public.owner_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can send their own messages"
  ON public.owner_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_owner_messages_updated_at
  BEFORE UPDATE ON public.owner_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();