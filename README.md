# Snakes & Ladders

A browser game of classic Snakes and Ladders. No build step, no dependencies — open the page and play.

## Play

Double-click `index.html`, or from this folder:

```bash
python3 -m http.server 8765
```

Then open [http://127.0.0.1:8765](http://127.0.0.1:8765).

## How to play

1. Choose **You vs Computer** or **Two players**. Changing mode starts a new game.
2. Click the die on your turn. Tokens start off the board (square 0) and walk onto 1–100.
3. **Green** paths are ladders (climb up). **Dashed red** paths are snakes (slide down).
4. You must land **exactly on 100** to win. If the roll would go past 100, you stay put.
5. Rolling a **6** grants another turn.
6. Use **New game** (or **Play again** after a win) to reset.

The move log on the right records each roll, ladder, and snake.

## Files

| File | Role |
| --- | --- |
| `index.html` | Page layout and controls |
| `style.css` | Board, tokens, die, and layout |
| `game.js` | Board numbering, dice, turns, snakes, and ladders |

## Board

Squares run 1–100 in a zigzag: left-to-right on odd rows from the bottom, right-to-left on even rows.

**Ladders**

| From | To |
| ---: | ---: |
| 4 | 14 |
| 9 | 31 |
| 20 | 38 |
| 28 | 84 |
| 40 | 59 |
| 51 | 67 |
| 63 | 81 |
| 71 | 91 |

**Snakes**

| From | To |
| ---: | ---: |
| 17 | 7 |
| 54 | 34 |
| 62 | 19 |
| 64 | 60 |
| 87 | 24 |
| 93 | 73 |
| 95 | 75 |
| 99 | 78 |

To change the board, edit the `LADDERS` and `SNAKES` objects at the top of `game.js`.
