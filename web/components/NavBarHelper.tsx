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
                            ? 'border-[#9a2b2b] text-[#9a2b2b] bg-[#9a2b2b]/5'
                            : 'border-stone-200 text-stone-500'
                        }`}
                >
                    {deck.name}
                </button>
            ))}
        </div>
    );
}
