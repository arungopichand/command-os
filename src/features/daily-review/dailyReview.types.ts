export interface DailyEntry {
  date: string;
  note: string;
  created_at: string;
  updated_at: string;
  mood?: string;
  tags?: string[];
}
