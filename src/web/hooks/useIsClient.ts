'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getSnapshot = () => true;

export function useIsClient(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
