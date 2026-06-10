// Memory-based traffic tracker for real-time visitor logs
// Using a global symbol to preserve memory state during Next.js hot-reloads in development

interface ActiveSession {
  lastActive: number;
  userAgent: string;
}

const GLOBAL_TRAFFIC_KEY = Symbol.for('ideaforge.traffic_data');

if (!(global as any)[GLOBAL_TRAFFIC_KEY]) {
  (global as any)[GLOBAL_TRAFFIC_KEY] = {
    sessions: new Map<string, ActiveSession>(),
    dailyVisits: {} as Record<string, number>,
    dailyUnique: {} as Record<string, Set<string>>,
  };
}

export const trafficTracker = (global as any)[GLOBAL_TRAFFIC_KEY] as {
  sessions: Map<string, ActiveSession>;
  dailyVisits: Record<string, number>;
  dailyUnique: Record<string, Set<string>>;
};

export function recordVisit(ip: string, userAgent: string) {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // 1. Log or update the active session (IP is the key)
  trafficTracker.sessions.set(ip, {
    lastActive: now,
    userAgent: userAgent || 'Unknown',
  });

  // 2. Increment total daily visits
  if (!trafficTracker.dailyVisits[today]) {
    trafficTracker.dailyVisits[today] = 0;
  }
  trafficTracker.dailyVisits[today]++;

  // 3. Add to daily unique visitor set
  if (!trafficTracker.dailyUnique[today]) {
    trafficTracker.dailyUnique[today] = new Set<string>();
  }
  trafficTracker.dailyUnique[today].add(ip);

  // 4. Cleanup inactive sessions (older than 10 minutes)
  for (const [key, value] of trafficTracker.sessions.entries()) {
    if (now - value.lastActive > 10 * 60 * 1000) {
      trafficTracker.sessions.delete(key);
    }
  }
}

export function getTrafficStats() {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];

  // Recalculate active sessions (active within last 5 minutes)
  let activeCount = 0;
  for (const value of trafficTracker.sessions.values()) {
    if (now - value.lastActive <= 5 * 60 * 1000) {
      activeCount++;
    }
  }

  return {
    activeUsers: Math.max(1, activeCount), // At least 1 (the admin viewing it)
    todayVisits: trafficTracker.dailyVisits[today] || 0,
    todayUnique: trafficTracker.dailyUnique[today]?.size || 0,
    dailyVisitsRecord: { ...trafficTracker.dailyVisits },
    dailyUniqueRecord: Object.keys(trafficTracker.dailyUnique).reduce((acc, dateKey) => {
      acc[dateKey] = trafficTracker.dailyUnique[dateKey]?.size || 0;
      return acc;
    }, {} as Record<string, number>),
  };
}
