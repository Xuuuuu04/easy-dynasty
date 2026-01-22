#!/bin/bash
mkdir -p public/sounds

echo "Generating placeholder sounds..."

# Use 'say' to create placeholders
# LEI16@44100 = Linear PCM 16-bit Integer Little Endian at 44.1kHz (WAV standard)

say -v "Ting-Ting" "Shuffle" -o public/sounds/shuffle.wav --data-format=LEI16@44100 || say "Shuffle" -o public/sounds/shuffle.wav --data-format=LEI16@44100
say -v "Ting-Ting" "Draw" -o public/sounds/draw.wav --data-format=LEI16@44100 || say "Draw" -o public/sounds/draw.wav --data-format=LEI16@44100
say -v "Ting-Ting" "Flip" -o public/sounds/flip.wav --data-format=LEI16@44100 || say "Flip" -o public/sounds/flip.wav --data-format=LEI16@44100
say -v "Ting-Ting" "Click" -o public/sounds/click.wav --data-format=LEI16@44100 || say "Click" -o public/sounds/click.wav --data-format=LEI16@44100
# Hover should be very short/silent to avoid annoyance if placeholder
say -v "Ting-Ting" "H" -o public/sounds/hover.wav --data-format=LEI16@44100 || say "H" -o public/sounds/hover.wav --data-format=LEI16@44100
say -v "Ting-Ting" "Reveal" -o public/sounds/reveal.wav --data-format=LEI16@44100 || say "Reveal" -o public/sounds/reveal.wav --data-format=LEI16@44100
say -v "Ting-Ting" "Land" -o public/sounds/land.wav --data-format=LEI16@44100 || say "Land" -o public/sounds/land.wav --data-format=LEI16@44100

# BGM
say -v "Ting-Ting" "Background Music Loop" -o public/sounds/bgm.wav --data-format=LEI16@44100 || say "Background Music Loop" -o public/sounds/bgm.wav --data-format=LEI16@44100

echo "Done. Please replace these files in public/sounds/ with actual sound effects."
