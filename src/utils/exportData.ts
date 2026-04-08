import { exportCommandOsData } from '../features/daily-review/dailyReviewExport';

export async function exportData() {
  await exportCommandOsData('json');
}
