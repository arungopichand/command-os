import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Global cache to prevent multiple hooks from fetching the same key concurrently
const cache: Record<string, any> = {};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 1. Initialize from LocalStorage for instant UI (Offline first)
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (cache[key]) return cache[key];
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // 2. Fetch ground-truth from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchFromSupabase() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_data')
        .select('json_data')
        .eq('user_id', user.id)
        .eq('key_name', key)
        .single();

      if (data && isMounted) {
        setStoredValue(data.json_data as T);
        window.localStorage.setItem(key, JSON.stringify(data.json_data));
        cache[key] = data.json_data;
      }
    }

    fetchFromSupabase();

    // 3. Subscribe to Realtime Updates (e.g. edited from phone)
    const channel = supabase.channel(`public:user_data:key_name=eq.${key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_data', filter: `key_name=eq.${key}` }, payload => {
         const newPayload = payload.new as any;
         if (newPayload && isMounted) {
            setStoredValue(newPayload.json_data as T);
            window.localStorage.setItem(key, JSON.stringify(newPayload.json_data));
            cache[key] = newPayload.json_data;
         }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [key]);

  // 4. Update function (Synchronous local + Asynchronous Supabase)
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Update Local React State instantly
      setStoredValue(valueToStore);
      
      // Update LocalStorage instantly
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      cache[key] = valueToStore;

      // Unblock UI, fire async update to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          key_name: key,
          json_data: valueToStore,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key_name' });

      if (error && error.code !== 'PGRST116') { // Ignore zero rows error
          console.warn('Error saving to Supabase:', error);
      }
      
    } catch (error) {
      console.error('Error saving to local/Supabase:', error);
    }
  };

  return [storedValue, setValue];
}
