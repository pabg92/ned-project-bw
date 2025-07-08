-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_to_newsletter boolean DEFAULT true,
  source text DEFAULT 'website',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  
  CONSTRAINT newsletter_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_created_at ON public.newsletter_subscribers(created_at);
CREATE INDEX idx_newsletter_subscribers_subscribed ON public.newsletter_subscribers(subscribed_to_newsletter) WHERE subscribed_to_newsletter = true;

-- Add RLS policies
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Admin users can view all subscribers
CREATE POLICY "Admin users can view all newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.clerk_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Admin users can manage subscribers
CREATE POLICY "Admin users can manage newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.clerk_id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores email newsletter subscriptions from the website';
COMMENT ON COLUMN public.newsletter_subscribers.source IS 'Where the subscription came from (e.g., cta_section, footer, popup)';
COMMENT ON COLUMN public.newsletter_subscribers.subscribed_to_newsletter IS 'Whether the user is currently subscribed to receive newsletters';