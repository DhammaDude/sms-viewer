# Individual Deity Frequency in the Rig Veda

A textual counting exercise: how often does each deity's own name actually
occur in the Rigveda's Sanskrit text? This is deliberately **not** the same
question as "who are the most important Rigvedic gods" or "who has the most
hymns dedicated to them" — it is a raw lexical-frequency count, framed
strictly within the Rigveda's own vocabulary, with no claim about later
Hindu tradition or theological rank.

**Everything in this report is a real count run against a real, cited
corpus.** No number here was estimated, guessed, or backfilled from general
knowledge. Where the data could not answer a question cleanly (name/common-
noun ambiguity, dvandva compounds), that is stated explicitly as a
limitation rather than papered over with a plausible number — see
[Limitations](#limitations) and the per-row notes in the tables.

*Revision note: an earlier pass of this report used a per-hymn export of
this same underlying annotation that only carried hymn-level references, so
it could not report distinct-verse counts and said so. This revision
switches to a differently-packaged export of the same project's annotation
that retains true stanza-level references, and distinct-verse counts are
now reported directly. See "Corpus used" below.*

## Corpus used

- **Source text**: the complete Śākala Rigveda-Saṃhitā (10 maṇḍalas, 1,028
  hymns, 10,552 verses), from
  [sanskrit-texts/rigveda](https://github.com/sanskrit-texts/rigveda),
  `merged/rigveda-{1..10}-annotated.csv` — one CSV per maṇḍala, `$`-delimited,
  combining H. Hettrich's verb-argument annotation with O. Hellwig's
  morpho-lexical annotation (the same Digital Corpus of Sanskrit pipeline
  used in the previous revision of this report), as published for Hellwig,
  Hettrich, Modi & Pinkal, "Multi-layer Annotation of the Rigveda" (LREC
  2018), CC BY 4.0.
- This is a **sandhi-split, lemmatized, POS-tagged** edition with genuine
  `book` / `chapter` / `strophe` / `verse` / `position` fields per token —
  i.e. mandala / hymn / **stanza** / pada-line / word-position. This is
  exactly the "machine-readable Sanskrit corpus with morphological/lexical
  annotation" the project specification asked for, with the added benefit
  (over the export used in the previous revision) of stanza-level addressing.
- All 10 maṇḍala files were downloaded and parsed successfully. The token
  data itself resolves to exactly **1,028 distinct hymns** and **10,552
  distinct verses (strophes)** — an exact match to the traditional count
  given in the project brief, which is a strong sanity check that the
  corpus and its reference numbering are intact and complete.
- Total token count across the corpus: **172,162**, of which only **255
  (0.15%)** carry an empty/placeholder lemma (`lemma = "_"`, `word = "_"` —
  these are non-lexical metrical placeholder slots in the annotation, not
  unparsed deity names; see Limitations). This is a much more completely
  resolved parse than the per-hymn export used in the previous revision
  (which had ~4% unresolved tokens), which is part of why the two revisions'
  counts differ very slightly (typically within 0–2%) even though both
  derive from the same underlying DCS project.

## Method actually used

1. **Direct lexical occurrences** = exact count of tokens whose *lemma*
   (dictionary citation form) matches the deity's name, optionally filtered
   by part-of-speech where a homonymous adjective exists (e.g. excluding the
   16 occurrences of `aśvin` tagged `ADJ`, meaning "possessing horses," from
   the Aśvin deity count; 441 total `aśvin`-lemma tokens minus those 16 ADJ
   tokens = 425 counted as the deity).
2. **Distinct verses** = the number of distinct `(book, chapter, strophe)`
   triples — i.e. distinct stanzas — containing at least one such token.
   **Distinct hymns** = the number of distinct `(book, chapter)` pairs, also
   reported for reference since a single hymn can run to 20+ verses.
3. **Collective/pair deities are counted separately** and are **not**
   distributed across their individual members. Where the corpus assigns a
   dvandva (pair-compound) its own fused lemma (e.g. `mitrāvaruṇa`,
   `dyāvāpṛthivī`, `agnīṣoma`), that lemma is counted as its own row. Where
   the parser instead splits the dvandva into two ordinary adjacent lemmas
   (this corpus does that for Indra-Agni and Indra-Vāyu specifically — there
   is no fused `indrāgni` or `indravāyu` lemma anywhere in the data), that is
   detected by strict same-hymn token adjacency and tallied separately; see
   the notes on those two rows.
4. **Name vs. epithet**: only words that are themselves the deity's proper
   name were counted. Epithets were deliberately *not* searched and folded
   in — e.g. Soma's epithet **indu** ("drop," 327 occurrences) was left out
   of the Soma count entirely, rather than assumed to mean Soma; Indra's
   epithets (śakra, maghavan, puraṃdara, etc.) were not searched for or
   added to the Indra count; **ṛbhukṣan**, which functions ambiguously as
   both the name of the senior Ṛbhu and, in some verses, as an epithet of
   Indra, was kept as its own separate, clearly-labeled row rather than
   merged into either. Where a word's own dictionary meaning is genuinely
   split between "this deity's proper name" and "an ordinary common noun"
   (agni/fire, soma/the plant, sūrya/the sun, uṣas/dawn, mitra/friend,
   bhaga/fortune, vāta/wind, pṛthivī/earth, rodasī/the-two-worlds), this is
   flagged per-row rather than silently resolved — see each row's Notes
   column.

## Top individual deities (direct lexical occurrences)

| Rank | Deity | Direct name occurrences | Distinct verses | Distinct hymns | Notes |
|---|---|---|---|---|---|
| 1 | Indra | 2601 | 2465 | 539 | Also base for compound Indra-Agni/Indra-Varuṇa/etc (tallied separately below); not fused with any common noun. |
| 2 | Agni | 1848 | 1720 | 409 | RV does not lexically separate "the god Agni" from "sacrificial/ritual fire"; all occurrences counted per RV's own non-distinction. Excludes Jamadagni (unrelated proper name) and dvandva compounds (tallied separately). |
| 3 | Soma | 1142 | 1092 | 413 | RV fuses "the god Soma" and "the soma plant/drink"; all occurrences counted together, per RV's own usage. Excludes dvandva compounds (Agni-Soma, Indra-Soma, etc.) and the epithet *indu* ("drop," 327 occurrences), which is not itself a proper name. |
| 4 | Varuṇa | 398 | 394 | 208 | |
| 5 | Sūrya | 390 | 387 | 264 | Sun as deity and as astronomical body are not lexically separated in RV; counted together. |
| 6 | Mitra | 349 | 340 | 218 | Sanskrit *mitra* can also mean common-noun "friend/ally"; lemma-level data cannot fully separate these senses. Some fraction of the count may be the common noun, not the deity. |
| 7 | Uṣas | 346 | 339 | 178 | Dawn goddess; word also denotes the physical dawn. RV does not separate these senses; counted together. |
| 8 | Pṛthivī | 322 | 321 | 229 | Earth as goddess and as physical earth are not lexically separated. Excludes the Dyāvā-Pṛthivī dvandva compound (tallied separately). |
| 9 | Savitṛ | 184 | 175 | 93 | |
| 10 | Aditi | 175 | 165 | 112 | Mother of the Ādityas; distinct from the collective "Āditya" entry. |
| 11 | Vāyu | 162 | 157 | 82 | Wind-god; distinct from Vāta (below), a separate RV wind-deity. |
| 12 | Rudra | 135 | 128 | 78 | |
| 13 | Bhaga | 129 | 121 | 91 | Also means common-noun "share/fortune"; not fully separable at lemma level. |
| 14 | Bṛhaspati | 125 | 123 | 60 | |
| 15 | Pūṣan | 122 | 120 | 71 | |
| 16 | Vāta | 121 | 118 | 102 | Wind-god distinct from Vāyu; word also used for ordinary "wind." |
| 17 | Aryaman | 117 | 117 | 83 | |
| 18 | Dyaus | 108 | 108 | 92 | Nominative-singular forms only (*dyauḥ*/*dyaur*), used as a proxy for the personified sky-father, since the base lemma *div* (971 occurrences) mostly means ordinary "sky/heaven/day" and cannot be reliably split into deity vs. common-noun senses. This is a heuristic lower bound, not a full lemma count — see Limitations. |
| 19 | Nāsatya | 102 | 102 | 56 | Counted separately per project spec, though in RV this word is itself used as a (dual) name/epithet of the Aśvin twins, not a wholly independent deity; substantial overlap with the Aśvin entry in the collective table is expected. |
| 20 | Viṣṇu | 99 | 99 | 68 | |
| 21 | Rodasī | 86 | 86 | 72 | Consort of the Maruts; the same word (dual) can also mean "the two worlds" (heaven-and-earth) as an ordinary noun. Not separable at lemma level; count likely includes some non-deity uses. |
| 22 | Yama | 76 | 72 | 52 | |
| 23 | Sarasvatī | 70 | 67 | 44 | River-goddess. |
| 24 | Tvaṣṭṛ | 65 | 65 | 58 | |
| 25 | Puraṃdhi | 49 | 49 | 45 | Minor goddess of abundance/bounty; the lemma also has an ordinary abstract-noun sense ("bounty, plenty") not separable at lemma level. Two anusvāra/n spelling variants of the same lemma summed. |
| 26 | Trita | 41 | 41 | 30 | Trita Āptya. |
| 27 | Vivasvant | 32 | 32 | 31 | |
| 27 | Parjanya | 32 | 32 | 23 | Rain-god; word also used for "rain cloud" generically in a few places. |
| 29 | Mātariśvan | 27 | 27 | 26 | |
| 30 | Apāṃ Napāt | 24 | 24 | 17 | Counted only where lemma *napāt* is immediately preceded, in the same hymn, by a form of *ap* (waters) — the fixed name "Apāṃ Napāt" (applied to Agni in his watery aspect). Excludes other *napāt* ("grandson/descendant") genitive phrases such as *divo napātā* or *manor napāt* (67 occurrences of the bare lemma in total), which are not this deity. |
| 31 | Dhātṛ | 20 | 19 | 17 | Minor creator-deity ("Establisher"); distinct from the unrelated verbal root homonym *dhā*. |
| 32 | Yamī | 4 | 4 | 2 | Yama's twin sister; very low frequency, included only for completeness near the bottom of the table. |

Deliberately **excluded** from this table (see Limitations for why):
**Ahi** (94 occurrences of the lemma, 94 verses, 67 hymns) is overwhelmingly
the serpent/demon Vṛtra slain by Indra, not a worshipped deity, so including
it as a "deity" row would misrepresent the count. **Manu** (79 occurrences,
77 verses, 68 hymns) is the primordial human ancestor/sacrificer, not
classed among the *devas* in the Rigveda's own usage, so he is also left out.

## Collective / pair deities

| Collective/pair | Occurrences | Distinct verses | Distinct hymns | Notes |
|---|---|---|---|---|
| Maruts | 432 | 422 | 169 | |
| Aśvins / Aśvinau | 425 | 421 | 118 | NOUN-tagged only; excludes 16 ADJ-tagged *aśvin* forms meaning "possessing horses" (441 total lemma occurrences minus those 16). Substantial lexical overlap with the separate Nāsatya row in the individual table above (Nāsatya is itself a name for the twins). |
| Ādityas (as a class) | 139 | 139 | 75 | Also occasionally used in the singular for one specific Āditya (e.g. Sūrya, Varuṇa); lemma-level data cannot separate these uses from the collective sense. |
| Indra-Agni | 113 | 113 | 34 | Adjacent, separately-lemmatized `indra` + `agni` tokens within the same hymn — this corpus has no single fused `indrāgni` lemma, so the dvandva is only recoverable this way. A heuristic, not a clean lemma count; may miss non-adjacent instances of the same construction and could rarely include coincidental adjacency. These occurrences are *also* included in the separate Indra and Agni rows above — they are **not** subtracted from those totals (see Limitations). |
| Viśve Devāḥ ("All-Gods") | 97 | 96 | 78 | Heuristic: adjacent tokens with lemmas *viśva* + *deva* in either order, within the same hymn — this is a fixed phrase in RV, not a fused compound lemma in this corpus. *viśva* is an extremely common ordinary adjective ("all/every"), so this adjacency heuristic is our best proxy, not an exact count. |
| Ṛbhus | 94 | 89 | 40 | |
| Mitra-Varuṇa | 92 | 92 | 60 | Fused dvandva compound, a distinct lemma from standalone Mitra/Varuṇa. |
| Dyāvā-Pṛthivī (Heaven-and-Earth) | 79 | 79 | 68 | Fused dvandva compound. |
| Indra-Varuṇa | 46 | 46 | 11 | |
| Indra-Vāyu | 40 | 40 | 22 | Same adjacency method as Indra-Agni above. Also included in the separate Indra and Vāyu individual totals; not subtracted from those totals. |
| Ṛbhukṣan (chief Ṛbhu / also an epithet of Indra) | 33 | 33 | 24 | Ambiguous between naming the senior Ṛbhu and being used as an epithet of Indra; kept separate rather than merged into either. |
| Agni-Soma | 14 | 14 | 3 | |
| Indra-Soma | 14 | 14 | 4 | |
| Soma-Pūṣan | 4 | 4 | 1 | |
| Soma-Rudra | 4 | 4 | 1 | |
| Indra-Pūṣan | 1 | 1 | 1 | |

Smaller pairings that surfaced in the data but were not separately tallied
(counts too small / detection too unreliable to report responsibly at this
pass): adjacent `indra`+`viṣṇu` and `agni`+`viṣṇu`, both single digits.

## Limitations (read before citing any number above)

- **Verse boundary = "strophe."** This edition's `strophe` field is the
  standard Rigvedic verse/stanza number within a hymn (e.g. RV 1.1 has
  strophes 1–9, matching the traditionally known 9 verses of that hymn); its
  separate `verse` field is a finer pada/line subdivision *within* a
  strophe, not used for the counts above. "Distinct verses" in this report
  means distinct strophes.
- **255 tokens (0.15%) have an empty/placeholder lemma** (`lemma = "_"`,
  and the word form itself is also literally `_`) — these read as
  intentional non-lexical placeholder slots in the annotation (e.g. marking
  an elided or metrically-restored position), not unparsed real words, so
  no deity-name recovery was attempted or needed there, unlike the earlier
  per-hymn export used in the previous revision of this report (which had a
  much larger, ~4%, genuinely-unparsed-word residue).
- **Personal-name vs. common-noun fusion.** Several of the highest-ranked
  entries (Agni/fire, Soma/the-drink, Sūrya/the-sun, Uṣas/dawn, Mitra/friend,
  Bhaga/fortune, Vāta/wind, Pṛthivī/earth, Rodasī/the-two-worlds,
  Dyaus/sky) share a single Sanskrit lemma between "the deity" and an
  ordinary word. Vedic philology does not, in general, cleanly separate
  these senses either — in Rigvedic theology, Agni genuinely *is* the fire,
  not merely named after it — so this report follows the corpus's own
  lemmatization and counts all occurrences of the shared lemma together,
  rather than inventing a semantic split the text itself does not make. The
  one deliberate exception is Dyaus, where the common-noun sense (971
  occurrences of "sky/heaven/day" in all cases) so overwhelms the
  personified sense that reporting the full lemma count under "Dyaus" would
  be actively misleading; there, a narrower nominative-singular-form proxy
  (108 occurrences) is reported instead, explicitly labeled as a lower-bound
  heuristic.
- **Dvandva (pair-compound) double-counting policy.** Where a name like
  Indra or Agni also occurs as one half of an adjacent Indra-Agni dvandva
  invocation, that occurrence is counted in **both** the individual deity's
  row and the collective/pair row. This is a disclosed, deliberate choice
  (the individual name genuinely occurs there) rather than a "no
  distribution" violation by omission — full disambiguation would require
  dependency-level syntactic judgment beyond what this pass verified at
  scale.
- **Aśvin/Nāsatya overlap** is real and unresolved: Nāsatya (and,
  traditionally, Dāsra) are themselves names applied to the Aśvin twins, so
  the two rows are not independent quantities, per the project's own
  instruction to keep them unmerged despite this.
- **No manual philological review** was performed on individual token
  occurrences at scale; this is an automated lemma-frequency count against
  one specific parsed edition, not a hand-verified philological census. The
  underlying parse (DCS / Oliver Hellwig's and H. Hettrich's pipeline) is a
  well-established, peer-published scholarly resource, but like any
  automatic Sanskrit parser it will carry some rate of tagging error, which
  was not independently audited here.
- **Manu and Ahi** were excluded from the individual-deity table as
  borderline (not consistently addressed as *devas* in the RV itself /
  overwhelmingly a demon-antagonist rather than a worshipped god,
  respectively) rather than silently included at face value.
- **Two independent exports of the same underlying DCS annotation produce
  slightly different counts** (typically within 0–2%) from this report's
  previous revision, which used a per-hymn CoNLL-U export
  ([unipv-larl/rv-formulas](https://github.com/unipv-larl/rv-formulas))
  rather than the per-maṇḍala CSV export used here
  ([sanskrit-texts/rigveda](https://github.com/sanskrit-texts/rigveda)).
  Both are real, citable exports of the same scholarly annotation project;
  the small differences reflect different snapshot dates and/or
  post-processing between the two derived distributions, not an error in
  either. This revision's numbers are considered the more reliable of the
  two because (a) its unresolved-token rate is far lower (0.15% vs. ~4%)
  and (b) its token/hymn/verse totals match the traditionally cited Rigveda
  counts (1,028 hymns, 10,552 verses) exactly, which the previous export
  could not be checked against at the verse level at all.

## Reproducing this

All source data and code used to produce the numbers above are in this
folder:

- `deities2.py` — loads all ten `rv{1..10}.csv` maṇḍala files, computes the
  deity-specific lemma lists, PoS filters, and same-hymn adjacency
  heuristics described above, and writes `individual_v2.json` /
  `collective_v2.json`, the source of the two tables in this report.
- The ten `rv{1..10}.csv` files (`sanskrit-texts/rigveda`,
  `merged/rigveda-N-annotated.csv`) are not included in this repository
  (~33 MB total); they are downloaded directly from
  `https://raw.githubusercontent.com/sanskrit-texts/rigveda/master/merged/rigveda-N-annotated.csv`
  for `N` = `1`–`10`. Re-running `deities2.py` requires those files to exist
  alongside it, named `rv1.csv`–`rv10.csv`.
- `count.py`, `deities.py`, `lemma_counts.csv`, `individual_final.json`, and
  `collective_results.json` are kept from the previous revision for
  reference/reproducibility of the numbers cited above in "Limitations,"
  but are superseded by `deities2.py` and its outputs as the source of this
  report's main tables.
