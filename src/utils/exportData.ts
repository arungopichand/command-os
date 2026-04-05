export function exportData() {
  const data: Record<string, any> = {};
  
  if (typeof window === "undefined") return;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const item = localStorage.getItem(key);
      try {
        data[key] = item ? JSON.parse(item) : null;
      } catch {
        data[key] = item;
      }
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "life_tracker_backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
