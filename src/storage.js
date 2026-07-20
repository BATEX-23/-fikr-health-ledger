// Drop-in replacement for the Claude-artifact `window.storage` API.
//
// When Supabase credentials are configured (VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY), data is stored in a shared `kv_store` table so
// everyone with the app link sees the same live data across devices. If
// those env vars are absent, it falls back to plain localStorage so the app
// still works standalone on a single device.
import { supabase } from "./supabaseClient";

const PREFIX = "fhi:";

function fullKey(key) {
  return PREFIX + key;
}

const localImpl = {
  async get(key) {
    const raw = window.localStorage.getItem(fullKey(key));
    if (raw === null) return null;
    return { key, value: raw };
  },

  async set(key, value) {
    window.localStorage.setItem(fullKey(key), value);
    return { key, value };
  },

  async delete(key) {
    const existed = window.localStorage.getItem(fullKey(key)) !== null;
    window.localStorage.removeItem(fullKey(key));
    return { key, deleted: existed };
  },

  async list(prefix = "") {
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(fullKey(prefix))) {
        keys.push(k.slice(PREFIX.length));
      }
    }
    return { keys, prefix };
  },

  // No cross-tab sync in the localStorage fallback — same-device state is
  // already reactive via React state.
  subscribe() {
    return () => {};
  },
};

const supabaseImpl = {
  async get(key) {
    const { data, error } = await supabase
      .from("kv_store")
      .select("value")
      .eq("key", fullKey(key))
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { key, value: data.value };
  },

  async set(key, value) {
    const { error } = await supabase
      .from("kv_store")
      .upsert({ key: fullKey(key), value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { key, value };
  },

  async delete(key) {
    const { error } = await supabase.from("kv_store").delete().eq("key", fullKey(key));
    if (error) throw error;
    return { key, deleted: true };
  },

  async list(prefix = "") {
    const { data, error } = await supabase
      .from("kv_store")
      .select("key")
      .like("key", `${fullKey(prefix)}%`);
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key.slice(PREFIX.length)), prefix };
  },

  // Calls `callback(value)` whenever another device changes this key.
  // Returns an unsubscribe function.
  subscribe(key, callback) {
    const channel = supabase
      .channel(`kv_store:${fullKey(key)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kv_store", filter: `key=eq.${fullKey(key)}` },
        (payload) => {
          const row = payload.eventType === "DELETE" ? null : payload.new;
          callback(row ? row.value : null);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export const storage = supabase ? supabaseImpl : localImpl;
