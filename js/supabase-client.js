/**
 * GymPulse — Supabase Client Initialization
 * 
 * IMPORTANT: Replace the placeholders below with your actual project details.
 * 
 * 1. SUPABASE_URL: Go to your Supabase Dashboard -> Project Settings -> API. Copy the "Project URL".
 * 2. SUPABASE_ANON_KEY: Go to the same API page. Copy the "anon" / "public" Project API key.
 * 
 * NEVER use the "service_role" key here. It has full admin access and is not safe for the browser.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://wqijxlfzjitritgmxljb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jV1hJBhS6R3C-YtbNBsHww_HR7vs-to';

// We expose the client on the global window object.
// This allows our existing standard scripts (like app.js) to access it easily without needing to be refactored into ES modules.
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
