'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DeckId, AVAILABLE_DECKS } from '../utils/cardImages';
import { useIsClient } from '@/hooks/useIsClient';

interface DeckContextType {
    currentDeck: DeckId;
    setDeck: (deck: DeckId) => void;
    availableDecks: typeof AVAILABLE_DECKS;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export function DeckProvider({ children }: { children: ReactNode }) {
    const isClient = useIsClient();
    const [currentDeck, setCurrentDeck] = useState<DeckId>(() => {
        if (typeof window === 'undefined') return 'rws';
        const savedDeck = localStorage.getItem('tarot_deck_preference');
        if (savedDeck && AVAILABLE_DECKS.some((d) => d.id === savedDeck)) {
            return savedDeck as DeckId;
        }
        return 'rws';
    });

    const setDeck = (deck: DeckId) => {
        setCurrentDeck(deck);
        localStorage.setItem('tarot_deck_preference', deck);
    };

    if (!isClient) {
        return null; // Or a loading spinner
    }

    return (
        <DeckContext.Provider value={{ currentDeck, setDeck, availableDecks: AVAILABLE_DECKS }}>
            {children}
        </DeckContext.Provider>
    );
}

export function useDeck() {
    const context = useContext(DeckContext);
    if (context === undefined) {
        throw new Error('useDeck must be used within a DeckProvider');
    }
    return context;
}
