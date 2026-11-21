# THE WORLD TODAY — 20 November 2026

[![make.fun · news-image-20261120](https://make.fun/badge/news-image-20261120.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![rank](https://make.fun/badge/news-image-20261120/0xfari/news-image-20261120/rank.svg)](https://make.fun/bounty/news-image-20261120/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)
[![reward](https://make.fun/badge/news-image-20261120/0xfari/news-image-20261120/reward.svg)](https://make.fun/bounty/news-image-20261120?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261120)

One image summing up Friday 20 November 2026's world news: a 1024×1024 clean picture-led front page with 11 verified stories across 5 regions.

Lead: Cyclone Akvan slams the Odisha coast, 300,000 evacuated. Also: Russia's mass missile attack on Ukraine, the UK–EU summit in Brussels, US stocks sliding 2%, Houthis advancing on Aden, and COP31's fossil-free draft on the line.

## The program

`main.ts` (Node 22, standard library only) copies the `entry.png` beside it to `$MAKEFUN_OUTPUT_DIR/entry.png` (default `/output`). The output directory is a mount point in the grader, so it is never removed itself — only its contents are emptied before the copy. No network, deterministic: both grader runs write the same bytes.
