#!/usr/bin/env python3
import glob, json, collections

def load_tokens():
    files = sorted(glob.glob("hymns/*.conllu"))
    per_hymn = {}  # file -> list of (form, lemma, upos)
    for f in files:
        toks = []
        for line in open(f, encoding="utf-8"):
            if not line.strip() or line.startswith("#"):
                continue
            cols = line.rstrip("\n").split("\t")
            if len(cols) < 10:
                continue
            toks.append((cols[1], cols[2], cols[3]))
        per_hymn[f] = toks
    return per_hymn

def lemma_stat(per_hymn, lemma, upos_filter=None):
    cnt = 0
    hymns = set()
    for f, toks in per_hymn.items():
        local = 0
        for form, lem, upos in toks:
            if lem == lemma and (upos_filter is None or upos in upos_filter):
                cnt += 1
                local += 1
        if local:
            hymns.add(f)
    return cnt, len(hymns)

def adjacency_stat(per_hymn, lemma_a, lemma_b):
    cnt = 0
    hymns = set()
    for f, toks in per_hymn.items():
        lemmas = [t[1] for t in toks]
        local = 0
        for i in range(len(lemmas) - 1):
            if (lemmas[i] == lemma_a and lemmas[i+1] == lemma_b) or \
               (lemmas[i] == lemma_b and lemmas[i+1] == lemma_a):
                local += 1
        if local:
            cnt += local
            hymns.add(f)
    return cnt, len(hymns)

def main():
    per_hymn = load_tokens()

    individual = [
        ("Indra", ["indra"], None, "Also base for compound Indra-Agni/Indra-Varuna/etc (tallied separately below); not fused with any common noun."),
        ("Agni", ["agni"], None, "RV does not lexically separate 'the god Agni' from 'sacrificial/ritual fire'; all occurrences counted per RV's own non-distinction. Excludes jamadagni (unrelated proper name) and dvandva compounds (tallied separately)."),
        ("Soma", ["soma"], None, "RV fuses 'the god Soma' and 'the soma plant/drink'; all occurrences counted together, per RV's own usage. Excludes dvandva compounds (agnisoma, indrasoma, etc., tallied separately)."),
        ("Varuna", ["varuṇa"], None, ""),
        ("Surya", ["sūrya"], None, "Sun as deity and as astronomical body are not lexically separated in RV; counted together."),
        ("Mitra", ["mitra"], None, "Sanskrit 'mitra' can also mean common-noun 'friend/ally'; lemma-level data cannot fully separate these senses. Some fraction of the count may be the common noun, not the deity."),
        ("Usas", ["uṣas"], None, "Dawn goddess; word also denotes the physical dawn. RV does not separate these senses; counted together."),
        ("Prthivi", ["pṛthivī"], None, "Earth as goddess and as physical earth are not lexically separated. Excludes the Dyava-Prthivi dvandva compound (tallied separately)."),
        ("Savitr", ["savitṛ"], None, ""),
        ("Aditi", ["aditi"], None, "Mother of the Adityas; distinct from the collective 'Aditya' entry."),
        ("Vayu", ["vāyu"], None, "Wind-god; distinct from Vata (below), a separate RV wind-deity."),
        ("Rudra", ["rudra"], None, ""),
        ("Bhaga", ["bhaga"], None, "Also means common-noun 'share/fortune'; not fully separable at lemma level."),
        ("Brhaspati", ["bṛhaspati"], None, ""),
        ("Pusan", ["pūṣan"], None, ""),
        ("Vata", ["vāta"], None, "Wind-god distinct from Vayu; word also used for ordinary 'wind'."),
        ("Aryaman", ["aryaman"], None, ""),
        ("Nasatya", ["nāsatya"], None, "Counted separately per project spec, though in RV this word is itself used as a (dual) name/epithet of the Asvin twins, not a wholly independent deity; substantial overlap with the Asvin entry in the collective table is expected."),
        ("Visnu", ["viṣṇu"], None, ""),
        ("Rodasi", ["rodasī"], None, "Consort of the Maruts; the same word (dual) can also mean 'the two worlds' (heaven-and-earth) as an ordinary noun. Not separable at lemma level; count likely includes some non-deity uses."),
        ("Yama", ["yama"], ["NOUN"], ""),
        ("Sarasvati", ["sarasvatī"], None, "River-goddess."),
        ("Tvastr", ["tvaṣṭṛ"], None, ""),
        ("Trita", ["trita"], None, "Trita Aptya."),
        ("Vivasvant", ["vivasvant"], None, ""),
        ("Parjanya", ["parjanya"], None, "Rain-god; word also used for 'rain cloud' generically in a few places."),
        ("Matarisvan", ["mātariśvan"], None, ""),
        ("Dhatr", ["dhātṛ"], None, "Minor creator-deity ('Establisher'); distinct from the verb-root homonym dha (excluded)."),
        ("Puramdhi", ["puraṃdhi", "purandhi"], None, "Minor goddess of abundance/bounty; the lemma also has an ordinary abstract-noun sense ('bounty, plenty') not separable at lemma level. Two anusvara/n spelling variants of the same lemma summed."),
        ("Yami", ["yamī"], None, "Yama's twin sister; very low frequency, included only for completeness near the bottom of the table."),
    ]

    print("=== INDIVIDUAL DEITIES (lemma-based) ===")
    rows = []
    for name, lemmas, upos_filter, note in individual:
        total_cnt, total_hymns = 0, set()
        for f, toks in per_hymn.items():
            local = 0
            for form, lem, upos in toks:
                if lem in lemmas and (upos_filter is None or upos in upos_filter):
                    local += 1
            if local:
                total_cnt += local
                total_hymns.add(f)
        rows.append((name, total_cnt, len(total_hymns), note))
    rows.sort(key=lambda r: -r[1])
    for r in rows:
        print(r)

    print()
    print("=== DYAUS (nominative-form proxy from lemma 'div') ===")
    dyaus_forms = {"dyauḥ", "dyaur", "dyauṣ"}
    cnt = 0
    hset = set()
    for f, toks in per_hymn.items():
        local = sum(1 for form, lem, upos in toks if lem == "div" and form in dyaus_forms)
        if local:
            cnt += local
            hset.add(f)
    print("Dyaus (nom. sg. forms only):", cnt, "hymns:", len(hset))
    div_total, div_hymns = lemma_stat(per_hymn, "div")
    print(f"  (for reference: full lemma 'div' incl. common-noun 'sky/heaven' = {div_total} in {div_hymns} hymns)")

    print()
    print("=== APAM NAPAT (adjacency 'ap' + 'napat') ===")
    c, h = adjacency_stat(per_hymn, "ap", "napāt")
    print("Apam Napat exact adjacency:", c, "hymns:", h)
    napat_total, napat_hymns = lemma_stat(per_hymn, "napāt")
    print(f"  (for reference: full lemma 'napāt' incl. non-Apam-Napat genitives like divo napātā, manor napāt = {napat_total} in {napat_hymns} hymns)")

    print()
    print("=== COLLECTIVE / PAIR DEITIES ===")
    collective = []
    c, h = lemma_stat(per_hymn, "aśvin", upos_filter=["NOUN"])
    collective.append(("Asvin(s) / Asvinau", c, h, "NOUN-tagged only; excludes 16 ADJ-tagged 'asvin' forms meaning 'possessing horses'. Substantial lexical overlap with the separate Nasatya entry above (Nasatya is itself a name for the twins)."))
    c, h = lemma_stat(per_hymn, "marut")
    collective.append(("Maruts", c, h, ""))
    c, h = lemma_stat(per_hymn, "mitrāvaruṇa")
    collective.append(("Mitra-Varuna", c, h, "Fused dvandva compound, distinct lemma from standalone Mitra/Varuna."))
    c, h = lemma_stat(per_hymn, "dyāvāpṛthivī")
    collective.append(("Dyava-Prthivi (Heaven-and-Earth)", c, h, "Fused dvandva compound."))
    c, h = lemma_stat(per_hymn, "indrāvaruṇa")
    collective.append(("Indra-Varuna", c, h, ""))
    c, h = lemma_stat(per_hymn, "agnīṣoma")
    collective.append(("Agni-Soma", c, h, ""))
    c, h = lemma_stat(per_hymn, "indrāsoma")
    collective.append(("Indra-Soma", c, h, ""))
    c, h = lemma_stat(per_hymn, "somāpūṣan")
    collective.append(("Soma-Pusan", c, h, ""))
    c, h = lemma_stat(per_hymn, "somārudra")
    collective.append(("Soma-Rudra", c, h, ""))
    c, h = lemma_stat(per_hymn, "indrāpūṣan")
    collective.append(("Indra-Pusan", c, h, ""))
    c, h = lemma_stat(per_hymn, "āditya", upos_filter=["NOUN"])
    collective.append(("Adityas (as a class)", c, h, "Also occasionally used in the singular for one specific Aditya (e.g. Surya, Varuna); lemma-level data cannot separate these uses from the collective sense."))
    c, h = lemma_stat(per_hymn, "ṛbhu")
    collective.append(("Rbhus", c, h, ""))
    c, h = lemma_stat(per_hymn, "ṛbhukṣan")
    collective.append(("Rbhuksan (chief Rbhu / also an epithet of Indra)", c, h, "Ambiguous between naming the senior Rbhu and being used as an epithet of Indra; not merged into either entry."))

    # recovered from unparsed sandhi/compound forms (lemma == '_')
    def recover(prefixes_forms):
        cnt = 0
        hset = set()
        for f, toks in per_hymn.items():
            local = sum(1 for form, lem, upos in toks if lem == "_" and form in prefixes_forms)
            if local:
                cnt += local
                hset.add(f)
        return cnt, len(hset)

    indragni_forms = {"indrāgnī", "indrāgnyor", "indrāgnibhyām", "indrāgne"}
    c, h = recover(indragni_forms)
    collective.append(("Indra-Agni", c, h, "Recovered by exact word-form match from tokens the automatic lemmatizer left unparsed (lemma='_'); not a lemma-based count like the rest of this table. Likely a slight undercount (rarer inflected forms not enumerated)."))

    indravayu_forms = {"indravāyū", "indravāyu", "indravāyū́"}
    c, h = recover(indravayu_forms)
    collective.append(("Indra-Vayu", c, h, "Same word-form recovery method as Indra-Agni above; likely a slight undercount."))

    c, h = adjacency_stat(per_hymn, "viśva", "deva")
    collective.append(("Visve Devah (All-Gods)", c, h, "Heuristic: adjacent tokens with lemmas 'visva' + 'deva' in either order, not a distinct compound lemma in this corpus (visve devah is a phrase, not a fused compound). 'visva' is extremely common as an ordinary adjective ('all/every'), so this heuristic is our best proxy, not an exact count; may miss non-adjacent instances and could in principle include rare coincidental adjacency."))

    collective.sort(key=lambda r: -r[1])
    for r in collective:
        print(r)

    with open("individual_results.json", "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)
    with open("collective_results.json", "w", encoding="utf-8") as f:
        json.dump(collective, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
