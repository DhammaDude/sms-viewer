#!/usr/bin/env python3
"""
Deity-name lemma counting against sanskrit-texts/rigveda 'merged' CSVs
(book$chapter$strophe$verse$...$word$lemma$...$udpos$...), which retain
true stanza-level references (book.chapter.strophe = mandala.hymn.verse).
Same DCS morpho-lexical annotation as before, but with verse granularity
preserved, unlike the per-hymn conllu fork used in the first pass.
"""
import csv, glob, json, collections

def load_rows():
    rows = []
    for path in sorted(glob.glob("rv*.csv"), key=lambda p: int(''.join(filter(str.isdigit, p)))):
        with open(path, encoding="utf-8") as f:
            r = csv.DictReader(f, delimiter="$")
            for row in r:
                rows.append(row)
    return rows

def stat(rows, lemmas, upos_filter=None):
    cnt = 0
    hymns = set()
    verses = set()
    for row in rows:
        if row["lemma"] in lemmas and (upos_filter is None or row["udpos"] in upos_filter):
            cnt += 1
            hymns.add((row["book"], row["chapter"]))
            verses.add((row["book"], row["chapter"], row["strophe"]))
    return cnt, len(hymns), len(verses)

def adjacency_stat(rows, lemma_a, lemma_b):
    # group by (book,chapter,strophe,verse) i.e. by pada/line, tokens are in 'position' order already
    cnt = 0
    hymns = set()
    verses = set()
    n = len(rows)
    for i in range(n - 1):
        a, b = rows[i], rows[i+1]
        # only compare within the same hymn to avoid boundary artifacts across hymns
        if a["book"] != b["book"] or a["chapter"] != b["chapter"]:
            continue
        pair = {a["lemma"], b["lemma"]}
        if pair == {lemma_a, lemma_b}:
            cnt += 1
            hymns.add((a["book"], a["chapter"]))
            verses.add((a["book"], a["chapter"], a["strophe"]))
    return cnt, len(hymns), len(verses)

def main():
    rows = load_rows()
    print("total tokens:", len(rows))

    individual = [
        ("Indra", ["indra"], None),
        ("Agni", ["agni"], None),
        ("Soma", ["soma"], None),
        ("Varuna", ["varuṇa"], None),
        ("Surya", ["sūrya"], None),
        ("Mitra", ["mitra"], None),
        ("Usas", ["uṣas"], None),
        ("Prthivi", ["pṛthivī"], None),
        ("Savitr", ["savitṛ"], None),
        ("Aditi", ["aditi"], None),
        ("Vayu", ["vāyu"], None),
        ("Rudra", ["rudra"], None),
        ("Bhaga", ["bhaga"], None),
        ("Brhaspati", ["bṛhaspati"], None),
        ("Pusan", ["pūṣan"], None),
        ("Vata", ["vāta"], None),
        ("Aryaman", ["aryaman"], None),
        ("Nasatya", ["nāsatya"], None),
        ("Visnu", ["viṣṇu"], None),
        ("Rodasi", ["rodasī"], None),
        ("Yama", ["yama"], ["NOUN"]),
        ("Sarasvati", ["sarasvatī"], None),
        ("Tvastr", ["tvaṣṭṛ"], None),
        ("Trita", ["trita"], None),
        ("Vivasvant", ["vivasvant"], None),
        ("Parjanya", ["parjanya"], None),
        ("Matarisvan", ["mātariśvan"], None),
        ("Dhatr", ["dhātṛ"], None),
        ("Puramdhi", ["puraṃdhi", "purandhi"], None),
        ("Yami", ["yamī"], None),
    ]

    results = []
    for name, lemmas, upos_filter in individual:
        c, h, v = stat(rows, lemmas, upos_filter)
        results.append([name, c, h, v])
    results.sort(key=lambda r: -r[1])

    print("\n=== INDIVIDUAL (lemma, count, hymns, verses) ===")
    for r in results:
        print(r)

    # Dyaus proxy: nominative sg forms of lemma 'div'
    dyaus_forms = {"dyauḥ", "dyaur", "dyauṣ"}
    cnt = 0; hset=set(); vset=set()
    for row in rows:
        if row["lemma"] == "div" and row["word"] in dyaus_forms:
            cnt += 1
            hset.add((row["book"], row["chapter"]))
            vset.add((row["book"], row["chapter"], row["strophe"]))
    print("\nDyaus (nom proxy):", cnt, len(hset), len(vset))
    div_c, div_h, div_v = stat(rows, ["div"])
    print("  (ref: full 'div' lemma =", div_c, div_h, div_v, ")")

    # Apam Napat: adjacency ap+napat within same verse/line
    c, h, v = adjacency_stat(rows, "ap", "napāt")
    print("\nApam Napat (adjacency):", c, h, v)
    napat_c, napat_h, napat_v = stat(rows, ["napāt"])
    print("  (ref: full 'napāt' lemma =", napat_c, napat_h, napat_v, ")")

    print("\n=== COLLECTIVE / PAIR ===")
    collective = []
    c,h,v = stat(rows, ["aśvin"], upos_filter=["NOUN"])
    collective.append(["Asvins", c, h, v])
    c,h,v = stat(rows, ["marut"])
    collective.append(["Maruts", c, h, v])
    c,h,v = stat(rows, ["mitrāvaruṇa"])
    collective.append(["Mitra-Varuna", c, h, v])
    c,h,v = stat(rows, ["dyāvāpṛthivī"])
    collective.append(["Dyava-Prthivi", c, h, v])
    c,h,v = stat(rows, ["indrāvaruṇa"])
    collective.append(["Indra-Varuna", c, h, v])
    c,h,v = stat(rows, ["agnīṣoma"])
    collective.append(["Agni-Soma", c, h, v])
    c,h,v = stat(rows, ["indrāsoma"])
    collective.append(["Indra-Soma", c, h, v])
    c,h,v = stat(rows, ["somāpūṣan"])
    collective.append(["Soma-Pusan", c, h, v])
    c,h,v = stat(rows, ["somārudra"])
    collective.append(["Soma-Rudra", c, h, v])
    c,h,v = stat(rows, ["indrāpūṣan"])
    collective.append(["Indra-Pusan", c, h, v])
    c,h,v = stat(rows, ["āditya"], upos_filter=["NOUN"])
    collective.append(["Adityas", c, h, v])
    c,h,v = stat(rows, ["ṛbhu"])
    collective.append(["Rbhus", c, h, v])
    c,h,v = stat(rows, ["ṛbhukṣan"])
    collective.append(["Rbhuksan", c, h, v])

    c,h,v = adjacency_stat(rows, "indra", "agni")
    collective.append(["Indra-Agni (adjacency)", c, h, v])
    c,h,v = adjacency_stat(rows, "indra", "vāyu")
    collective.append(["Indra-Vayu (adjacency)", c, h, v])
    c,h,v = adjacency_stat(rows, "viśva", "deva")
    collective.append(["Visve Devah (adjacency)", c, h, v])

    collective.sort(key=lambda r: -r[1])
    for r in collective:
        print(r)

    json.dump(results, open("individual_v2.json","w"), ensure_ascii=False, indent=2)
    json.dump(collective, open("collective_v2.json","w"), ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
