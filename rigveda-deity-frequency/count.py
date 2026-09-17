#!/usr/bin/env python3
"""
Count deity-name lemma occurrences across the DCS-parsed Rigveda corpus
(unipv-larl/rv-formulas, rv_conllu/, 1028 hymn files, CoNLL-U format,
parser/lemmatizer by Oliver Hellwig / Digital Corpus of Sanskrit).

For each token line we read: lemma (col 3), upos (col 4), and Ref=... from
the misc column (col 10), which gives the hymn address (mandala.hymn).
There is no verse/pada-level Ref in this derived file set, so "distinct
verse" counts are NOT computable from this corpus; we report distinct-hymn
coverage instead and say so explicitly.
"""
import glob, re, json, collections, csv

HYMN_DIR = "hymns"

def iter_tokens():
    for path in sorted(glob.glob(f"{HYMN_DIR}/*.conllu")):
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.rstrip("\n")
                if not line or line.startswith("#"):
                    continue
                cols = line.split("\t")
                if len(cols) < 10:
                    continue
                idx, form, lemma, upos = cols[0], cols[1], cols[2], cols[3]
                misc = cols[9]
                m = re.search(r"Ref=([0-9]+\.[0-9]+)", misc)
                ref = m.group(1) if m else None
                yield {"file": path, "form": form, "lemma": lemma, "upos": upos, "ref": ref}

def main():
    lemma_counts = collections.Counter()
    lemma_hymns = collections.defaultdict(set)
    lemma_upos = collections.defaultdict(collections.Counter)
    total_tokens = 0
    total_hymns = set()

    for t in iter_tokens():
        total_tokens += 1
        if t["ref"]:
            total_hymns.add(t["ref"])
        lemma_counts[t["lemma"]] += 1
        if t["ref"]:
            lemma_hymns[t["lemma"]].add(t["ref"])
        lemma_upos[t["lemma"]][t["upos"]] += 1

    print(f"Total tokens: {total_tokens}")
    print(f"Total hymns with Ref tags: {len(total_hymns)}")

    with open("lemma_counts.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["lemma", "count", "distinct_hymns", "upos_breakdown"])
        for lemma, cnt in lemma_counts.most_common():
            w.writerow([lemma, cnt, len(lemma_hymns[lemma]), dict(lemma_upos[lemma])])

    # dump raw counts as json too, for the deity-specific script to load
    with open("lemma_counts.json", "w", encoding="utf-8") as f:
        json.dump({
            "counts": dict(lemma_counts),
            "hymns": {k: sorted(v) for k, v in lemma_hymns.items()},
            "upos": {k: dict(v) for k, v in lemma_upos.items()},
        }, f, ensure_ascii=False)

    print("Wrote lemma_counts.csv and lemma_counts.json")

if __name__ == "__main__":
    main()
