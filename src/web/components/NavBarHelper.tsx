import { useDeck } from '@/context/DeckContext';

function DeckSwitcherMobile() {
    const { currentDeck, setDeck, availableDecks } = useDeck();

    return (
        <div className="flex flex-col gap-2">
            {availableDecks.map((deck) => (
                <button
                    key={deck.id}
                    onClick={() => setDeck(deck.id)}
                    className={`text-sm px-4 py-2 rounded-full border transition-all ${currentDeck === deck.id
                            ? 'border-accent-main text-accent-main bg-accent-main/5'
                            : 'border-border text-text-muted hover:text-text-main'
                        }`}
                >
                    {deck.name}
                </button>
            ))}
        </div>
    );
}
