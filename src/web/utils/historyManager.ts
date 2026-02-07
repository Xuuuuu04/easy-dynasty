import type { DrawnCard, ReadingHistory } from '@/types/tarot';

export type { TarotCard, DrawnCard, ReadingHistory } from '@/types/tarot';

const HISTORY_STORAGE_KEY = 'tarot_reading_history';
const MAX_HISTORY_ITEMS = 50;
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface CloudHistoryRecord {
    id: string | number;
    created_at: string;
    data: Omit<ReadingHistory, 'id' | 'timestamp'>;
}

export const historyManager = {
    // Local Storage Methods (Legacy/Guest)
    getLocalHistory(): ReadingHistory[] {
        if (typeof window === 'undefined') return [];
        try {
            const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
            if (!stored) return [];
            return (JSON.parse(stored) as ReadingHistory[]).sort(
                (a, b) => b.timestamp - a.timestamp
            );
        } catch (error) {
            console.error('Failed to load local history:', error);
            return [];
        }
    },

    // Cloud Methods
    async fetchCloudHistory(): Promise<ReadingHistory[]> {
        const token = localStorage.getItem('token');
        if (!token) return [];

        try {
            const res = await fetch(`${API_URL}/api/v1/history?limit=100`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to fetch history');

            const records = (await res.json()) as CloudHistoryRecord[];
            return records.map((r) => ({
                id: r.id.toString(),
                timestamp: new Date(r.created_at).getTime(),
                ...r.data,
            }));
        } catch (error) {
            console.error('Cloud history fetch error:', error);
            return [];
        }
    },

    async fetchCloudReadingById(id: string): Promise<ReadingHistory | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const res = await fetch(`${API_URL}/api/v1/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return null;

            const r = await res.json();
            return {
                id: r.id.toString(),
                timestamp: new Date(r.created_at).getTime(),
                ...r.data,
            };
        } catch (error) {
            console.error('Cloud item fetch error:', error);
            return null;
        }
    },

    async saveReading(
        question: string,
        spreadName: string = '',
        spreadId: string = '',
        drawnCards: DrawnCard[] = [],
        analysis: string,
        type: 'tarot' | 'bazi' = 'tarot',
        extraData: Record<string, unknown> = {}
    ): Promise<ReadingHistory> {
        const timestamp = Date.now();
        const newReading: ReadingHistory = {
            id: `local_${timestamp}`,
            timestamp,
            question,
            spreadName,
            spreadId,
            drawnCards,
            analysis,
            ...extraData,
        };

        // 1. Save Local (Backup)
        if (typeof window !== 'undefined') {
            try {
                const history = this.getLocalHistory();
                const updatedHistory = [newReading, ...history].slice(0, MAX_HISTORY_ITEMS);
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
            } catch (e) {
                console.error('Local save failed', e);
            }
        }

        // 2. Save Cloud (if logged in)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = {
                        type,
                        title: question || (type === 'bazi' ? '八字排盘' : '塔罗占卜'),
                        data: {
                            question,
                            spreadName,
                            spreadId,
                            drawnCards,
                            analysis,
                            timestamp,
                            ...extraData,
                        },
                    };

                    void fetch(`${API_URL}/api/v1/history/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(payload),
                    }).catch((error) => {
                        console.error('Cloud save request failed', error);
                    });
                } catch (e) {
                    console.error('Cloud save failed', e);
                }
            }
        }

        return newReading;
    },

    async deleteCloudReading(id: string): Promise<boolean> {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const res = await fetch(`${API_URL}/api/v1/history/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.ok;
        } catch {
            return false;
        }
    },

    deleteReading(id: string): void {
        if (typeof window === 'undefined') return;

        try {
            const history = this.getLocalHistory();
            const updatedHistory = history.filter((item) => item.id !== id);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('Failed to delete history item:', error);
        }
    },

    clearAllHistory(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    },
};
