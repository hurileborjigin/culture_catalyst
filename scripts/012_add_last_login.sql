-- Add last_login column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Seed varied last_login dates for demo users
-- Some active (recent), some dormant (weeks ago), some very inactive (months ago)
DO $$
DECLARE
  all_ids UUID[];
  total INT;
BEGIN
  SELECT array_agg(id) INTO all_ids FROM public.profiles;
  total := array_length(all_ids, 1);

  IF total IS NULL OR total = 0 THEN
    RAISE NOTICE 'No profiles found';
    RETURN;
  END IF;

  -- First 2 users: active (logged in today/yesterday)
  IF total >= 1 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '2 hours' WHERE id = all_ids[1];
  END IF;
  IF total >= 2 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '1 day' WHERE id = all_ids[2];
  END IF;

  -- Next 2 users: somewhat active (logged in 3-5 days ago)
  IF total >= 3 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '3 days' WHERE id = all_ids[3];
  END IF;
  IF total >= 4 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '5 days' WHERE id = all_ids[4];
  END IF;

  -- Next 2 users: dormant (2-4 weeks ago) — good re-engagement targets
  IF total >= 5 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '14 days' WHERE id = all_ids[5];
  END IF;
  IF total >= 6 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '28 days' WHERE id = all_ids[6];
  END IF;

  -- Next users: very inactive (1-3 months ago)
  IF total >= 7 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '45 days' WHERE id = all_ids[7];
  END IF;
  IF total >= 8 THEN
    UPDATE public.profiles SET last_login = NOW() - interval '90 days' WHERE id = all_ids[8];
  END IF;

  -- Any remaining: null last_login (registered but never really logged in — dead users)
  FOR i IN 9..total LOOP
    UPDATE public.profiles SET last_login = NULL WHERE id = all_ids[i];
  END LOOP;

  RAISE NOTICE 'Seeded last_login for % profiles', total;
END $$;
