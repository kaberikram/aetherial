-- Lock down public credit-reset RPCs and the Dreampop leaderboard.
--
-- Apply this file to the live database (project zenmxqngniqpihzezamr) after
-- merge. Opening the pull request does not change production.
--
-- pg_cron (live):
--   job 1  0 0 * * *   SELECT reset_daily_usage();          username postgres
--   job 3  0 16 * * *  SELECT manual_reset_all_credits();   username postgres
-- Both jobs keep working: they run as postgres, and that role still has EXECUTE.
-- The app never calls either function.
--
-- public.manual_reset_all_credits() is SECURITY DEFINER (owner postgres) and
-- deletes image_generation_usage rows. Revoke EXECUTE from PUBLIC, anon, and
-- authenticated. Keep EXECUTE for postgres (cron) and service_role.
-- Pin search_path so the definer body cannot be shadowed by a caller schema
-- or a temporary table (pg_temp is listed last).
--
-- public.test_reset_daily_usage() is SECURITY DEFINER, is not referenced by
-- the app, and is not scheduled. Drop it.
--
-- public.reset_daily_usage() is SECURITY INVOKER and stays as-is. Cron job 1
-- runs it as postgres, which bypasses RLS. A client call is still subject to
-- RLS, and image_generation_usage has no DELETE policy for anon or authenticated.
--
-- No other SECURITY DEFINER functions exist in public.
--
-- Dreampop (app/dreampop) uses the anon key:
--   select name, score from leaderboard order by score desc limit 5
--   insert (name, score)  -- trimmed name, 1..15 chars; integer score >= 0
--   select count(*) where score > submitted score
-- No client updates or deletes.

DROP FUNCTION IF EXISTS public.test_reset_daily_usage();

REVOKE EXECUTE ON FUNCTION public.manual_reset_all_credits() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.manual_reset_all_credits() TO postgres, service_role;

ALTER FUNCTION public.manual_reset_all_credits()
  SET search_path = public, pg_temp;

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.leaderboard FROM anon, authenticated;

CREATE POLICY "Public can read leaderboard"
  ON public.leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can insert dreampop scores"
  ON public.leaderboard
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 15
    AND char_length(btrim(name)) >= 1
    AND score >= 0
  );

-- credit_reset_logs has RLS on, but policy user_can_view_own_logs is FOR ALL
-- with no predicate (the table has no user_id). The anon key can read, forge,
-- or delete reset audit rows, and TRUNCATE ignores RLS. The app does not query
-- this table. manual_reset_all_credits() inserts into it as postgres.
DROP POLICY IF EXISTS "user_can_view_own_logs" ON public.credit_reset_logs;

REVOKE ALL ON TABLE public.credit_reset_logs FROM anon, authenticated;
