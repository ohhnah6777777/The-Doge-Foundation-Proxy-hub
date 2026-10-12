CREATE TABLE public.proxy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  url text NOT NULL CHECK (char_length(url) BETWEEN 1 AND 500),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proxy_requests TO authenticated;
GRANT ALL ON public.proxy_requests TO service_role;
ALTER TABLE public.proxy_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create own requests" ON public.proxy_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Users read own requests" ON public.proxy_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update requests" ON public.proxy_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete requests" ON public.proxy_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.custom_proxies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  status text NOT NULL DEFAULT 'working' CHECK (status IN ('working','partial','down')),
  links text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_proxies TO authenticated;
GRANT ALL ON public.custom_proxies TO service_role;
ALTER TABLE public.custom_proxies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read proxies" ON public.custom_proxies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins insert proxies" ON public.custom_proxies FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update proxies" ON public.custom_proxies FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete proxies" ON public.custom_proxies FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins read all messages" ON public.owner_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));