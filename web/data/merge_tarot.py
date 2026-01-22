import json
import os

def merge_tarot_data():
    base_dir = '/Users/xushaoyang/Desktop/命理与塔罗/easydynasty/web/data'
    cards_path = os.path.join(base_dir, 'tarot-cards.json')
    meanings_path = os.path.join(base_dir, 'tarot_meanings_zh.json')

    with open(cards_path, 'r', encoding='utf-8') as f:
        cards_data = json.load(f)

    with open(meanings_path, 'r', encoding='utf-8') as f:
        meanings_data = json.load(f)

    # Helper to find meaning ignoring case
    def get_meaning(name):
        return meanings_data.get(name) or meanings_data.get(name.lower()) or meanings_data.get(name.title())

    # Update Major Arcana
    for card in cards_data['majorArcana']:
        meaning = get_meaning(card['englishName'])
        if meaning:
            card['uprightMeaning'] = meaning['upright']
            card['reversedMeaning'] = meaning['reversed']
        else:
            print(f"Warning: No meaning found for {card['englishName']}")

    # Update Minor Arcana
    for suit in cards_data['minorArcana']:
        for card in cards_data['minorArcana'][suit]:
            meaning = get_meaning(card['englishName'])
            if meaning:
                card['uprightMeaning'] = meaning['upright']
                card['reversedMeaning'] = meaning['reversed']
            else:
                print(f"Warning: No meaning found for {card['englishName']}")

    # Save
    with open(cards_path, 'w', encoding='utf-8') as f:
        json.dump(cards_data, f, ensure_ascii=False, indent=2)
    
    print("Successfully updated tarot-cards.json with detailed meanings.")

if __name__ == "__main__":
    merge_tarot_data()
