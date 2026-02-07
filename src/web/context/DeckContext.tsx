'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeckId, AVAILABLE_DECKS } from '../utils/cardImages';

interface DeckContextType {
    currentDeck: DeckId;
    setDeck: (deck: DeckId) => void;
    availableDecks: typeof AVAILABLE_DECKS;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export function DeckProvider({ children }: { children: ReactNode }) {
    const [currentDeck, setCurrentDeck] = useState<DeckId>('rws');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load preference from localStorage
        const savedDeck = localStorage.getItem('tarot_deck_preference');
        if (savedDeck && AVAILABLE_DECKS.some((d) => d.id === savedDeck)) {
            setCurrentDeck(savedDeck as DeckId);
        }
        setIsLoaded(true);
    }, []);

    const setDeck = (deck: DeckId) => {
        setCurrentDeck(deck);
        localStorage.setItem('tarot_deck_preference', deck);
    };

    if (!isLoaded) {
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
