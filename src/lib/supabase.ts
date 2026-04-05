import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://buyamorkqyintgqzaxho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eWFtb3JrcXlpbnRncXpheGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjkyNDAsImV4cCI6MjA5MDk0NTI0MH0.OPL6Vz_ff6U0bXvkN6peXo8EMrxjuS5ZYiaFTmRnliA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
