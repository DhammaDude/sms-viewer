# Individual Deity Frequency in the Rig Veda

A textual counting exercise: how often does each deity's own name actually
occur in the Rigveda's Sanskrit text? This is deliberately **not** the same
question as "who are the most important Rigvedic gods" or "who has the most
hymns dedicated to them" — it is a raw lexical-frequency count, framed
strictly within the Rigveda's own vocabulary, with no claim about later
Hindu tradition or theological rank.

**Everything in this report is a real count run against a real, cited
corpus.** No number here was estimated, guessed, or backfilled from general
knowledge. Where the corpus's own data could not answer a question cleanly
(verse-level counts, name/common-noun ambiguity, dvandva compounds), that is
stated explicitly as a limitation rather than papered over with a plausible
number — see [Limitations](#limitations) and the per-row notes in the
tables.

## Corpus used

- **Source text**: the complete Śākala Rigveda-Saṃhitā (10 maṇḍalas, 1,028
  hymns), in the version of the [Digital Corpus of Sanskrit (DCS)](https://github.com/OliverHellwig/sanskrit)
  (Oliver Hellwig, 2010–2021, CC BY 4.0), as redistributed per-hymn in
  CoNLL-U format by [unipv-larl/rv-formulas](https://github.com/unipv-larl/rv-formulas)
  (`rv_conllu/`, files `0000.conllu`–`1027.conllu`, one file per hymn in
  Rigveda order).
- This is a **sandhi-split, lemmatized, POS-tagged, dependency-parsed**
  edition — i.e. exactly the kind of "machine-readable Sanskrit corpus with
  morphological/lexical annotation" the project specification asked for, not
  a plain-text scrape and not a translation. Sandhi-splitting matters
  specifically because it resolves word boundaries that are fused in the
  plain Saṃhitā text, which is what makes reliable automated word counting
  possible at all.
- 1,028 files were downloaded and parsed; all 1,028 were retrieved
  successfully (verified against the traditional maṇḍala/hymn count of
  1,028 hymns).
- Total token count across the corpus: **176,570** tokens (words), of which
  7,036 (~4.0%) came back with an unresolved lemma (`lemma = "_"` — sandhi
  or compound forms the automatic parser could not split/lemmatize; see
  Limitations).
- Every token carries a `Ref=` tag giving its maṇḍala.hymn address (e.g.
  `Ref=1.1`); **this corpus does not carry a stanza/verse-level reference**,
  only hymn-level. See "On verse counts" below.

## Method actually used

1. **Direct lexical occurrences** = exact count of tokens whose *lemma*
   (dictionary citation form, as assigned by the DCS parser) matches the
   deity's name, optionally filtered by part-of-speech where a homonymous
   adjective exists (e.g. excluding the 16 occurrences of `aśvin` tagged
   `ADJ`, meaning "possessing horses," from the Aśvin deity count).
2. **Distinct hymns** = the number of distinct hymns (not verses — see
   below) containing at least one such token.
3. **Collective/pair deities are counted separately** and are **not**
   distributed across their individual members. Where the corpus assigns a
   dvandva (pair-compound) its own fused lemma (e.g. `mitrāvaruṇa`,
   `dyāvāpṛthivī`, `agnīṣoma`), that lemma is counted as its own row. Where
   the automatic parser instead left the compound unparsed, or split it into
   two adjacent ordinary lemmas, that is also recovered and tallied
   separately as described row-by-row in the collective table (see notes on
   Indra-Agni and Indra-Vāyu).
4. **Name vs. epithet**: only words that are themselves the deity's proper
   name were counted. Epithets were deliberately *not* searched and folded
   in — e.g. Soma's epithet **indu** ("drop," 324 occurrences) was left out
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

| Rank | Deity | Direct name occurrences | Distinct hymns | Notes |
|---|---|---|---|---|
| 1 | Indra | 2576 | 539 | Also base for compound Indra-Agni/Indra-Varuṇa/etc (tallied separately below); not fused with any common noun. |
| 2 | Agni | 1840 | 409 | RV does not lexically separate "the god Agni" from "sacrificial/ritual fire"; all occurrences counted per RV's own non-distinction. Excludes Jamadagni (unrelated proper name) and dvandva compounds (tallied separately). |
| 3 | Soma | 1137 | 412 | RV fuses "the god Soma" and "the soma plant/drink"; all occurrences counted together, per RV's own usage. Excludes dvandva compounds (Agni-Soma, Indra-Soma, etc., tallied separately). Excludes the epithet *indu* ("drop," 324 occurrences), which is not itself a proper name. |
| 4 | Varuṇa | 397 | 207 | |
| 5 | Sūrya | 389 | 263 | Sun as deity and as astronomical body are not lexically separated in RV; counted together. |
| 6 | Mitra | 343 | 214 | Sanskrit *mitra* can also mean common-noun "friend/ally"; lemma-level data cannot fully separate these senses. Some fraction of the count may be the common noun, not the deity. |
| 7 | Uṣas | 341 | 177 | Dawn goddess; word also denotes the physical dawn. RV does not separate these senses; counted together. |
| 8 | Pṛthivī | 321 | 228 | Earth as goddess and as physical earth are not lexically separated. Excludes the Dyāvā-Pṛthivī dvandva compound (tallied separately). |
| 9 | Savitṛ | 182 | 92 | |
| 10 | Aditi | 174 | 112 | Mother of the Ādityas; distinct from the collective "Āditya" entry. |
| 11 | Vāyu | 161 | 82 | Wind-god; distinct from Vāta (below), a separate RV wind-deity. |
| 12 | Rudra | 135 | 78 | |
| 13 | Bhaga | 129 | 91 | Also means common-noun "share/fortune"; not fully separable at lemma level. |
| 14 | Bṛhaspati | 124 | 59 | |
| 15 | Pūṣan | 122 | 71 | |
| 16 | Vāta | 120 | 101 | Wind-god distinct from Vāyu; word also used for ordinary "wind." |
| 17 | Aryaman | 117 | 83 | |
| 18 | Nāsatya | 100 | 56 | Counted separately per project spec, though in RV this word is itself used as a (dual) name/epithet of the Aśvin twins, not a wholly independent deity; substantial overlap with the Aśvin entry in the collective table is expected. |
| 19 | Viṣṇu | 99 | 68 | |
| 20 | Dyaus | 98 | 84 | Nominative-singular forms only (*dyauḥ*/*dyaur*), used as a proxy for the personified sky-father, since the base lemma *div* (975 occurrences) mostly means ordinary "sky/heaven/day" and cannot be reliably split into deity vs. common-noun senses. This is a heuristic lower bound, not a full lemma count — see Limitations. |
| 21 | Rodasī | 90 | 75 | Consort of the Maruts; the same word (dual) can also mean "the two worlds" (heaven-and-earth) as an ordinary noun. Not separable at lemma level; count likely includes some non-deity uses. |
| 22 | Yama | 76 | 52 | |
| 23 | Sarasvatī | 69 | 44 | River-goddess. |
| 24 | Tvaṣṭṛ | 65 | 58 | |
| 25 | Puraṃdhi | 49 | 45 | Minor goddess of abundance/bounty; the lemma also has an ordinary abstract-noun sense ("bounty, plenty") not separable at lemma level. Two anusvāra/n spelling variants of the same lemma summed. |
| 26 | Trita | 40 | 30 | Trita Āptya. |
| 27 | Vivasvant | 33 | 31 | |
| 28 | Parjanya | 32 | 23 | Rain-god; word also used for "rain cloud" generically in a few places. |
| 29 | Mātariśvan | 27 | 26 | |
| 30 | Apāṃ Napāt | 24 | 17 | Counted only where lemma *napāt* is immediately preceded by a form of *ap* (waters) — the fixed name "Apāṃ Napāt" (applied to Agni in his watery aspect). Excludes other *napāt* ("grandson/descendant") genitive phrases such as *divo napātā* or *manor napāt*, which are not this deity. |
| 31 | Dhātṛ | 20 | 17 | Minor creator-deity ("Establisher"); distinct from the unrelated verbal root homonym *dhā*. |
| 32 | Yamī | 4 | 2 | Yama's twin sister; very low frequency, included only for completeness near the bottom of the table. |

Deliberately **excluded** from this table (see Limitations for why):
**Ahi** (94 occurrences of the lemma) is overwhelmingly the serpent/demon
Vṛtra slain by Indra, not a worshipped deity, so including it as a "deity"
row would misrepresent the count. **Manu** (79 occurrences) is the
primordial human ancestor/sacrificer, not classed among the *devas* in the
Rigveda's own usage, so he is also left out.

## Collective / pair deities

| Collective/pair | Occurrences | Distinct hymns | Notes |
|---|---|---|---|
| Maruts | 428 | 169 | |
| Aśvins / Aśvinau | 422 | 118 | NOUN-tagged only; excludes 16 ADJ-tagged *aśvin* forms meaning "possessing horses." Substantial lexical overlap with the separate Nāsatya row in the individual table above (Nāsatya is itself a name for the twins). |
| Indra-Agni | 168 | 34 | Combines (a) tokens where the automatic lemmatizer left the sandhi-fused compound unparsed (recovered by exact word-form match: *indrāgnī*, *indrāgnyor*, *indrāgnibhyām*, *indrāgne*), and (b) adjacent, separately-lemmatized `indra` + `agni` tokens (the parser's sandhi-split treatment of the same dvandva). A heuristic, not a single clean lemma count; may include rare false positives from coincidental adjacency and may still miss some inflected forms. These occurrences are *also* included in the separate Indra and Agni rows above — they are **not** subtracted from those totals (see Limitations). |
| Ādityas (as a class) | 138 | 75 | Also occasionally used in the singular for one specific Āditya (e.g. Sūrya, Varuṇa); lemma-level data cannot separate these uses from the collective sense. |
| Ṛbhus | 93 | 40 | |
| Viśve Devāḥ ("All-Gods") | 93 | 76 | Heuristic: adjacent tokens with lemmas *viśva* + *deva* in either order — this is a fixed phrase in RV, not a single fused compound lemma in this corpus. *viśva* is an extremely common ordinary adjective ("all/every"), so this adjacency heuristic is our best proxy, not an exact count; may miss non-adjacent instances and could in principle include rare coincidental adjacency. |
| Mitra-Varuṇa | 91 | 60 | Fused dvandva compound, a distinct lemma from standalone Mitra/Varuṇa. |
| Dyāvā-Pṛthivī (Heaven-and-Earth) | 79 | 68 | Fused dvandva compound. |
| Indra-Vāyu | 49 | 22 | Same combined method as Indra-Agni above. Also included in the separate Indra and Vāyu individual totals; not subtracted from those totals. |
| Indra-Varuṇa | 46 | 11 | |
| Ṛbhukṣan (chief Ṛbhu / also an epithet of Indra) | 33 | 24 | Ambiguous between naming the senior Ṛbhu and being used as an epithet of Indra; kept separate rather than merged into either. |
| Agni-Soma | 14 | 3 | |
| Indra-Soma | 14 | 4 | |
| Soma-Pūṣan | 4 | 1 | |
| Soma-Rudra | 4 | 1 | |
| Indra-Pūṣan | 1 | 1 | |

Smaller pairings that surfaced in the data but were not separately tallied
(counts too small / detection too unreliable to report responsibly at this
pass): adjacent `indra`+`viṣṇu` (8 occurrences, 8 hymns), adjacent
`agni`+`viṣṇu` (2 occurrences, 2 hymns).

## On verse counts

The project specification asks for **distinct verses**, not distinct hymns,
specifically to stop one heavily-repeated invocation in a single stanza from
skewing the ranking. **This corpus does not support that**: its `Ref=`
metadata resolves only to the maṇḍala.hymn level (e.g. `Ref=7.86`), not to
the individual stanza (which would need something like `Ref=7.86.3`). A
Rigvedic hymn averages roughly 10 verses, so "distinct hymns" is a
substantially coarser unit than "distinct verses," and the two numbers are
**not interchangeable**. The "Distinct hymns" columns above are reported
because they are real, verifiable numbers from this corpus, not because they
answer the question that was asked. Getting genuine verse-level distinct
counts would require either (a) a differently-structured edition of this
same DCS annotation that retains stanza-level `Ref`, or (b) mapping every
sentence boundary in this file set back to the standard verse numbering by
hand/rule, which was out of scope here. This is flagged rather than
silently worked around.

## Limitations (read before citing any number above)

- **Verse-level granularity is unavailable**, as just described; "distinct
  hymns" is reported instead and is explicitly not the same metric.
- **~4% of the corpus's tokens (7,036 of 176,570) have no resolved lemma**
  (`lemma = "_"`), typically sandhi junctures or compounds the automatic
  parser couldn't split. A small number of these were manually recovered
  by exact word-form matching for the Indra-Agni and Indra-Vāyu dvandvas
  specifically, because they were high-frequency and easy to identify with
  confidence; the rest of this unparsed residue was **not** individually
  audited, so every count in this report is a slight undercount by an
  unknown (likely small, single-digit-percent) margin.
- **Personal-name vs. common-noun fusion.** Several of the highest-ranked
  entries (Agni/fire, Soma/the-drink, Sūrya/the-sun, Uṣas/dawn, Mitra/friend,
  Bhaga/fortune, Vāta/wind, Pṛthivī/earth, Rodasī/the-two-worlds,
  Dyaus/sky) share a single Sanskrit lemma between "the deity" and an
  ordinary word. Vedic philology does not, in general, cleanly separate
  these senses either — in Rigvedic theology, Agni genuinely *is* the fire,
  not merely named after it — so this report follows the corpus's own
  lemmatization and counts all occurrences of the shared lemma together,
  rather than inventing a semantic split the text itself does not make. The
  one deliberate exception is Dyaus, where the common-noun sense (975
  occurrences of "sky/heaven/day" in all cases) so overwhelms the
  personified sense that reporting the full lemma count under "Dyaus" would
  be actively misleading; there, a narrower nominative-singular-form proxy
  (98 occurrences) is reported instead, explicitly labeled as a lower-bound
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
  underlying parse (DCS / Oliver Hellwig's pipeline) is a well-established
  scholarly resource, but like any automatic Sanskrit parser it will carry
  some rate of tagging error, which was not independently audited here.
- **Manu and Ahi** were excluded from the individual-deity table as
  borderline (not consistently addressed as *devas* in the RV itself /
  overwhelmingly a demon-antagonist rather than a worshipped god,
  respectively) rather than silently included at face value.

## Reproducing this

All source data and code used to produce the numbers above are in this
folder:

- `count.py` — pass 1: full corpus-wide lemma frequency table
  (`lemma_counts.csv`).
- `deities.py` — pass 2: the deity-specific lemma lists, adjacency
  heuristics, and unparsed-form recovery described above; produces
  `individual_final.json` and `collective_results.json`, the source of the
  two tables in this report.
- `hymns/` is not included in this repository (1,028 files, ~29 MB); it is
  downloaded directly from
  `https://raw.githubusercontent.com/unipv-larl/rv-formulas/master/rv_conllu/NNNN.conllu`
  for `NNNN` = `0000`–`1027`. Re-running `count.py`/`deities.py` requires
  that directory to exist alongside them.
