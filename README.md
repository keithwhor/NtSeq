# NtSeq

**NtSeq** is an open source Bioinformatics library written in JavaScript
that provides DNA sequence manipulation and analysis tools for node and the
browser.

More specifically, it's a library for dealing with all kinds of nucleotide sequences,
including *degenerate nucleotides*. It's built with the developer (and scientist)
in mind with simple, readable methods that are part of the standard molecular
biologist's vocabulary.

## Sequence Alignment / Mapping

Additionally, **NtSeq** comes with a novel, highly optimized exhaustive sequence
mapping / comparison tool known as **Nt.MatchMap**.

**Nt.MatchMap** allows you to *find all ungapped alignments between two degenerate nucleotide sequences, ordered by the number of matches*. Also provided is a list of results showing the number of each match count, which can be useful for determining if certain sequences or variations are over-represented in a target genome. (P-values, unfortunately, are out of the scope of this project.)

**MatchMap** uses bit operations to exhaustively scan a search sequence at a rate of up to 10x faster than a standard naive alignment implementation that uses string comparisons. It can run at a rate of up to **approximately 500,000,000 nucleotide comparisons per second** single-threaded on a 2.4GHz processor.

An explanation of the algorithm used will be made available shortly. In the meantime, the code
is open source and MIT-licensed so feel free to figure it out!

Tests and benchmarks are included in this repository which can be easily run from the command line using node / npm. A sample benchmark is also included in this README. :)

New to bioinformatics, or never played with a nucleotide sequence before?
Check out [Nucleic Acid Notation](http://en.wikipedia.org/wiki/Nucleic_acid_notation)
to get started.

## What can I do with NtSeq?

- Quickly scan genomic data for target sequences or ungapped relatives using `.mapSequence()`

- Grab the 5' -> 3' complement of a sequence with `.complement()`

- Manipulate sequences easily using `.replicate()`, `.deletion()`, `.insertion()`, `.repeat()` and `.polymerize()`

- Translate your nucleotide sequences in a single line of code using `.translate()` or `.translateFrame()`

- Quickly determine AT% content with `.content()` or `.fractionalContent()`

- Grab *approximate* AT% content for degenerate sequences using `.contentATGC()` or `.fractionalContentATGC()`

- Load FASTA files into memory from your machine (node) with `.loadFASTA()` or from a string if you use an external AJAX request (web) using `.readFASTA()`

- Save large sequences for easy accession in the future using a new filetype, `.4bnt` that will cut your FASTA file sizes in half with `.save4bnt()` and `.load4bnt()` (**node only**)

## Installation

### Node

**NtSeq** is available as a node package, and can be installed with:

```
$ npm install ntseq
```

You can use NtSeq in your node project by using:

```javascript
var Nt = require('ntseq');
```

(The [node.js version](https://www.npmjs.com/package/ntseq) has some useful
additional tools as compared to the web version.)

### Web

In order to use NtSeq on a webpage, download `ntseq.js` from the `web` folder of
this repository and include it in a script tag, like so (assuming it is in the
same directory as your page):

```javascript
<script src="ntseq.js"></script>
```

If you're new to writing web applications, a sample page that uses NtSeq is
available as `index.html` (in the `web` directory).

### Quick Usage

The `Nt` namespace contains two constructor methods, `Nt.Seq` and `Nt.MatchMap`.
You can use these by calling:

```javascript
// Create and put data into a new nucleotide sequence
var seqA = new Nt.Seq();
seqA.read('ATGC');

// Create an RNA sequence - identical to DNA, but RNA will output 'U' instead of 'T'
var seqB = new Nt.Seq('RNA');
seqB.read('ATGCATGC');

// Create a MatchMap of seqA aligned against seqB.
var map = new Nt.MatchMap(seqA, seqB);

// Additionally, this line is equivalent to the previous
var map = seqB.mapSequence(seqA);
```

## Examples

Let's start with a simple sequence...

```javascript
var seq = new Nt.Seq();
seq.read('AATT');
```

Great, now I can start playing around with it. :)

```javascript
var repeatedSeq = seq.repeat(3);

// Logs 'AATT'
console.log(seq.sequence());
// Logs 'AATTAATTAATT'
console.log(repeatedSeq.sequence());

// Can shorten to one line...
var gcSeq = (new Nt.Seq()).read('GCGC');

var insertedSeq = repeatedSeq.insertion(gcSeq, 4);

// Logs 'AATTGCGCAATTAATT'
console.log(insertedSeq.sequence());
```

We can combine sequences together...

```javascript
// is 'AATTGCGCAATTAATTGCGC'
insertedSeq.polymerize(gcSeq).sequence();
```

And we find the reverse complement in a flash!

```javascript
var complementMe = (new Nt.Seq()).read('CCAATT');
// is 'AATTGG'
complementMe.complement().sequence();
```

Translating sequences to amino acid sequences is trivial...

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
// Translate at nucleotide offset 0
seq.translate(); // === 'MPDC'
// Translate at nucleotide offset 1
seq.translate(1); // === 'CPTA'
// Translate at nucleotide offset 0, 1 amino acid into the frame
seq.translateFrame(0, 1); // === 'PDC'
```

Determine the AT% Content of my sequence... what fraction is A?

```javascript
seq.fractionalContent()['A'] // === 0.23076923076923078, about 23%!
```

Hmm, well this is a small sequence but I want to find where "CCCG" matches

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('CCCG');
var map = seq.mapSequence(querySeq);
map.best().position; // === 3
```

What about degenerate matching, 'ASTG'?

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('ASTG');
var map = seq.mapSequence(querySeq);
map.best().position; // === 7
```

What if there are no perfect matches?

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('CCCW');
var map = seq.mapSequence(querySeq);
map.best().position; // === 3
map.best().matches; // === 3
map.best().alignment().sequence(); // === 'CCCG'

// this is the actual nucleotides that match, gaps for non-matches
map.best().alignmentMask().sequence(); // === 'CCC-'

// this is the optimistic sequence that could match both
map.best().alignmentCover().sequence(); // === 'CCCD'

// .matchFrequencyData provides the number of times a certain number of matches were
//    found. In this example, the sequence didn't find any matches at 6
//    locations. Keep in mind the sequence attempts to align outside of the
//    upper and lower bounds of the search space.
//      i.e.     ATGC
//             CCCW
map.matchFrequencyData(); // === [ 6, 8, 3, 2, 0 ]
```

## Benchmarks and Tests

NtSeq has a number of integration tests that you can access (after cloning the
  repository).

Run tests with

```
$ npm test
```

And run benchmarks with

```
$ npm run benchmark
```

You should get an output that looks (roughly) like the following (taken
  Feb 7th, 2015 on a 2.4GHz processor).

```
Benchmark         |        naive |       search |   naiveScore |  searchScore
--------------------------------------------------------------------------------
1,000,000, 0%     |          9ms |          3ms |    9.00ns/nt |    3.00ns/nt
10,000,000, 0%    |         63ms |          5ms |    6.30ns/nt |    0.50ns/nt
100,000,000, 0%   |        621ms |         60ms |    6.21ns/nt |    0.60ns/nt
1,000,000, 25%    |         15ms |          6ms |   15.00ns/nt |    6.00ns/nt
10,000,000, 25%   |        124ms |         17ms |   12.40ns/nt |    1.70ns/nt
100,000,000, 25%  |       1249ms |        233ms |   12.49ns/nt |    2.33ns/nt
1,000,000, 50%    |         15ms |          2ms |   15.00ns/nt |    2.00ns/nt
10,000,000, 50%   |        131ms |         20ms |   13.10ns/nt |    2.00ns/nt
100,000,000, 50%  |       1305ms |        234ms |   13.05ns/nt |    2.34ns/nt
1,000,000, 100%   |         14ms |          2ms |   14.00ns/nt |    2.00ns/nt
10,000,000, 100%  |        144ms |         18ms |   14.40ns/nt |    1.80ns/nt
100,000,000, 100% |       1471ms |        240ms |   14.71ns/nt |    2.40ns/nt
```

**naive** refers to a simple string implementation of exhaustive alignment
mapping (no heuristics), and **search** refers to the **MatchMap** optimized
bit op alignment mapping, providing the same result (no heuristics either!).

The scores (lower is better) are calculated by dividing the total execution time
  in nanoseconds by the input size in (*m* x *n* where *m* is search (large)
  sequence length and *n* is query sequence length).

The benchmark titles indicate the total size of the search space, and what
percent identity (similarity) the sequences have to one another.

# Library Reference

### Nt.Seq

#### (constructor) Nt.Seq( [optional String seqType] )

Construct a new Nt.Seq object. `seqType` can be `'DNA'` or `'RNA'`.

```javascript
var seq = (new Nt.Seq());
```

---

#### Nt.Seq#read( [String sequenceData] )

returns `self`

Reads the sequenceData into the `Nt.Seq` object.

Expects the sequence data to be read 5' -> 3' (left to right).

```javascript
seq.read('ATGCATGC');
```

---

#### Nt.Seq#readFASTA( [String fastaData] )

returns `self`

Reads a lone FASTA file into the `Nt.Seq` object, removing comments
and ignoring line breaks.

---

#### Nt.Seq#size()

returns `Integer`

Returns the size (length in nucleotides) of the sequence.

---

#### Nt.Seq#sequence()

returns `String`

Returns the nucleotide sequence as a string

---

#### Nt.Seq#complement()

returns `Nt.Seq`

Creates a new `Nt.Seq` object with complementary sequence data.

```javascript
var seq = (new Nt.Seq()).read('ATGC');
var complement = seq.complement();

// Will read: 'GCAT'
complement.sequence();
```

---

#### Nt.Seq#equivalent( [Nt.Seq compareSequence] )

returns `Boolean`

Tells us whether two sequences are equivalent (same nucleotide data and
  type, RNA or DNA).

---

#### Nt.Seq#replicate( [optional Integer offset], [optional Integer length] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object, starting at an optional offset and continuing to
the specified length. If length is unspecified, will continue until the end of
the sequence.

---

#### Nt.Seq#polymerize( [Nt.Seq sequence] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object that is the result of concatenating the current
and provided `sequence` together.

---

#### Nt.Seq#insertion( [Nt.Seq insertedSequence], [Integer offset] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object that is the result of inserting `insertedSequence`
at the specified offset.

---

#### Nt.Seq#deletion( [Nt.Seq offset], [Integer length] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object that is the result of deleting (removing)
nucleotides from the current sequence beginning at `offset` and continue to
`length`.

---

#### Nt.Seq#repeat( [Integer count] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object that is the result of repeating the current
sequence `count` number of times. (0 will return an empty sequence, 1 will
  return an identical sequence.)

---

#### Nt.Seq#mask( [Nt.Seq sequence] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object that is the result of aligning the current
  sequence and provided `sequence` and choosing this most pessimistic match
  between nucleotides. (Provides a sequence containing only exactly matching
    nucleotides.)

  See [Nucleic Acid Notation](http://en.wikipedia.org/wiki/Nucleic_acid_notation) for more information

```javascript
var seqA = (new Nt.Seq()).read('ATGC');
var seqB = (new Nt.Seq()).read('AWTS')

var seqC = seqA.mask(seqB);
seqC.sequence(); // === 'AT-C'
```

---

#### Nt.Seq#cover( [Nt.Seq sequence] )

returns `Nt.Seq`

Creates a new `Nt.Seq` object that is the result of aligning the current
  sequence and provided `sequence` and choosing this most optimistic match
  between nucleotides. (Provides a sequence that will match both.)

  See [Nucleic Acid Notation](http://en.wikipedia.org/wiki/Nucleic_acid_notation) for more information

```javascript
var seqA = (new Nt.Seq()).read('ATGC');
var seqB = (new Nt.Seq()).read('AWTS')

var seqC = seqA.cover(seqB);
seqC.sequence(); // === 'AWKS'
```

---

#### Nt.Seq#content()

returns `Object`

Returns a Object (hash table) containing the frequency counts of nucleotides,
**including degenerate nucleotides (16 results total)**.

```javascript
var seqA = (new Nt.Seq()).read('ATGC');

var content = seqA.content();
/* Looks like:
  {
    'A': 1, 'T': 1, 'G': 1, 'C': 1, 'S': 0, 'W': 0, 'N': 0 [...]
  }
*/

var Acontent = content['A']; // === 1
```

---

#### Nt.Seq#fractionalContent()

returns `Object`

Returns a Object (hash table) containing the fraction of nucleotides present in
the sequence, **including degenerate nucleotides (16 results total)**.

```javascript
var seqA = (new Nt.Seq()).read('ATGC');

var content = seqA.fractionalContent();
/* Looks like:
  {
    'A': 0.25, 'T': 0.25, 'G': 0.25, 'C': 0.25, 'S': 0, 'W': 0, 'N': 0 [...]
  }
*/

var Acontent = content['A']; // === 0.25
```

---

#### Nt.Seq#contentATGC()

returns `Object`

Returns a Object (hash table) containing frequency counts of **only the four
non-degenerate nucleotides**.

**NOTE:** Degenerate nucleotides are counted as *fractions*
of A, T, G, or C with this method. (N = 0.25 x A, 0.25 x G, 0.25 x T, 0.25 x C).

```javascript
var seqA = (new Nt.Seq()).read('ATNN');

var content = seqA.contentATGC();
/* Looks like:
  {
    'A': 1.5,
    'T': 1.5,
    'G': 0.5,
    'C': 0.5
  }
*/

var Acontent = content['A']; // === 1.5
```

---

#### Nt.Seq#fractionalContentATGC()

returns `Object`

Returns a Object (hash table) containing the fraction of **only the four
non-degenerate nucleotides**.

**NOTE:** Degenerate nucleotides are counted as *fractions*
of A, T, G, or C with this method. (N = 0.25 x A, 0.25 x G, 0.25 x T, 0.25 x C).

```javascript
var seqA = (new Nt.Seq()).read('ATNN');

var content = seqA.fractionalContentATGC();
/* Looks like:
  {
    'A': 0.375,
    'T': 0.375,
    'G': 0.125,
    'C': 0.125
  }
*/

var Acontent = content['A']; // === 0.375
```

---

#### Nt.Seq#translate( [optional Integer offset], [optional Integer length] )

returns `String`

Returns a string containing the Amino Acid sequence represented by the nucleotide
sequence, starting at a nucleotide provided by `offset` and continuing for `length`
**nucleotides (not amino acids!)**. If `offset` is not provided, the entire
sequence will be translated. If `length` is not provided, translation will
continue until the end of the sequence.

See [Amino Acid Abbreviations](http://en.wikipedia.org/wiki/Amino_acid#Table_of_standard_amino_acid_abbreviations_and_properties) for more details.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
// Translate at nucleotide offset 0
seq.translate(); // === 'MPDC'
// Translate at nucleotide offset 1
seq.translate(1); // === 'CPTA'
// Translate at nucleotide offset 1, continue for 6 nucleotides (2 AAs)
seq.translate(1, 6); // === 'CP'
```

---

#### Nt.Seq#translateFrame( [optional Integer frame], [optional Integer AAoffset], [optional Integer AAlength] )

returns `String`

Returns a string containing the Amino Acid sequence represented by the current
nucleotide sequence. Translation can begin at one of three `frame`s (0, 1 or 2)
and then begin at an Amino Acid specified by `AAoffset` and continuing for `AAlength`
Amino Acids. If `AAoffset` is not provided, the entire sequence will be translated.
If `AAlength` is not provided, translation will continue until the end of the sequence.

**NOTE:** Remember the difference! `.translateFrame()` uses **amino acid** offsets,
while `.translate()` uses **nucleotide** offsets.

See [Amino Acid Abbreviations](http://en.wikipedia.org/wiki/Amino_acid#Table_of_standard_amino_acid_abbreviations_and_properties) for more details.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
// Translate entire sequence
seq.translateFrame(); // === 'MPDC'
// Translate beginning at frame 1 (offset by 1 nt)
seq.translateFrame(1); // === 'CPTA'
// Translate from frame 1 (offset by 1 nt), start by offset of 1 amino acid
//   and continue for 2 amino acids
seq.translateFrame(1, 1, 2); // === 'PT'
```

---

#### Nt.Seq#mapSequence( [Nt.Seq querySequence] )

returns `Nt.MatchMap`

Creates a new `Nt.MatchMap` object using the provided `querySequence` as a search
query in the larger sequence. Equivalent to `new MatchMap(querySequence, currentSequence)`.

See **Nt.MatchMap** for more details.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('TGC');

var map = seq.mapSequence(querySeq); // === (new Nt.MatchMap(querySeq, seq))

```

---

#### Nt.Seq#loadFASTA( [String pathname] )

returns `self`

**NODE ONLY**

Will load sequence data from a FASTA file located at the provided `pathname`

---

#### Nt.Seq#load4bnt( [String pathname] )

returns `self`

**NODE ONLY**

Will load sequence data from a `.4bnt` file located at the provided `pathname`

(`.4bnt` is short for "4-bit nucleotide")

---

#### Nt.Seq#save4bnt( [optional String name], [optional String path] )

returns `self`

**NODE ONLY**

Will save sequence data as `name.4bnt` in a directory located at `path`.

If `name` is not provided, it will be automatically generated as `sequence_TIME.4bnt`
where `TIME` is the current UNIX timestamp in milliseconds.

If `path` is not provided, the directory you're running the process from will be
used.

(`.4bnt` is short for "4-bit nucleotide")

---

### Nt.MatchMap

#### (constructor) Nt.Matchmap( [Nt.Seq querySeq], [Nt.Seq searchSeq] )

Construct a new `Nt.MatchMap` object that queries `searchSeq` for matches of
`querySeq`. Performs exhaustive degenerate nucleotide matching at every
combination of nucleotides and stores the results. Results are ordered by alignment
of position 0 of `querySeq` with a position in `searchSeq` (starting with negative offsets).

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('TGC');

var map = new Nt.MatchMap(querySeq, seq); // === seq.mapSequence(querySeq);
```

---

#### Nt.MatchMap#results( [optional Integer offset], [optional Integer count] )

returns `Array (of Object)`

Provides results in an array, ordered from the leftmost offset (negative alignment
  of `querySeq` relative to `searchSeq`) as element 0.

Objects returned will be hashes containing the following:

```javascript
{
  position: [Integer],
  matches: [Integer]
}
```

Will `Array#slice` on the result array depending on `offset` and `count`.
(Returns subset of the Array).

---

#### Nt.MatchMap#best()

returns `Nt.MatchResult`

Provides the best possible alignment match of `querySeq` in `searchSeq` as
a new `Nt.MatchResult` object. See **Nt.MatchResult** for more details.

**NOTE:** There is no guarantee that the sorted results based on matches will be
stable, do not write code that expects this to always be identical given ties
of top match counts.

---

#### Nt.MatchMap#top( [Integer count] )

returns `Array (of Nt.MatchResult)`

Provides an Array containing the **best** possible alignment matches of `querySeq`
in `searchSeq` as new `Nt.MatchResult` objects. See **Nt.MatchResult** for more
details.

**NOTE:** There is no guarantee that the sorted results based on matches will be
stable, do not write code that expects this to always be identical given ties
of top match counts.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('TGC');

var map = new Nt.MatchMap(querySeq, seq);
var topArray = map.top(2); // === [ Nt.MatchResult, Nt.MatchResult ]
```

---

#### Nt.MatchMap#bottom( [Integer count] )

returns `Array (of Nt.MatchResult)`

Provides an Array containing the **worst** possible alignment matches of `querySeq`
in `searchSeq` as new `Nt.MatchResult` objects. See **Nt.MatchResult** for more
details.

**NOTE:** There is no guarantee that the sorted results based on matches will be
stable, do not write code that expects this to always be identical given ties
of bottom match counts.

---

#### Nt.MatchMap#matchFrequencyData()

returns `Array (of Integers)`

Provides an Array containing the frequency distribution of all matches.
The Array will be the same length as `querySequence.size()`, the *0*-indexed
element represents the number of times **no (0)** matches were found considering
all possible alignments,  and the *n*-indexed element represents the number of
times **n** matches were found considering all possible alignments.


---

### Nt.MatchResult

#### INACCESSIBLE (constructor) Nt.MatchResult

Create `Nt.MatchResult` using the `Nt.MatchMap#best`, `Nt.MatchMap#top` and
`Nt.MatchMap#bottom` methods.

#### Properties

##### .position

  The alignment position of this MatchResult in `searchSequence` of your
  `Nt.MatchMap`.

##### .matches

  The number of matches between `querySequence` and `searchSequence` at this
  alignment position.

---

#### Nt.MatchResult#alignment()

returns `Nt.Seq`

Creates a new `Nt.Seq` instance representing the portion of your `searchSequence`
aligned at the associated `Nt.MatchResult` position. Will be `querySequence.size()`
nucleotides long.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('TGCTC');

var map = new Nt.MatchMap(querySeq, seq);
var bestMatch = map.best();

bestMatch.alignment().sequence(); // === 'TGCCC'
```

---

#### Nt.MatchResult#alignmentMask()

returns `Nt.Seq`

Creates a new `Nt.Seq` instance representing a `Nt.Seq#mask()` of the portion of your `searchSequence` aligned at the associated `Nt.MatchResult` position.
Will be `querySequence.size()` nucleotides long.

See **Nt.Seq#mask** for more information.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('TGCTC');

var map = new Nt.MatchMap(querySeq, seq);
var bestMatch = map.best();

bestMatch.alignmentMask().sequence(); // === 'TGC-C'
```

---

#### Nt.MatchResult#alignmentCover()

returns `Nt.Seq`

Creates a new `Nt.Seq` instance representing a `Nt.Seq#cover()` of the portion of your `searchSequence` aligned at the associated `Nt.MatchResult` position.
Will be `querySequence.size()` nucleotides long.

See **Nt.Seq#cover** for more information.

```javascript
var seq = (new Nt.Seq()).read('ATGCCCGACTGCA');
var querySeq = (new Nt.Seq()).read('TGCTC');

var map = new Nt.MatchMap(querySeq, seq);
var bestMatch = map.best();

bestMatch.alignmentCover().sequence(); // === 'TGCYC'
```

---

# Appendix

## Background

The initial purpose for developing this library was to find all sequences similar
to a consensus sequence for a protein's DNA-binding domain in a genome. It was
hypothesized that this protein could act to inhibit transcription by occluding
the binding of RNA polymerase in multiple locations. I wanted a tool that could
generate a list of all of these potential sites of inhibition (sites that the
protein could potentially bind) ordered by their similarity to a consensus
sequence.

I had previous experimental results listing a number of nucleotide sequences
that this DNA-binding domain had high-affinity for. I had to use multiple tools
to A) generate the consensus from identified binding sequences for this protein,
B) use BLAST to try and find sequences that matched. Unfortunately, BLAST did
not support the use the degenerate consensus sequence that I felt would give the
best and largest set of results (potential binding sites in the genome) to test.

Using **NtSeq**, the `Nt.Seq#cover` method can generate consensus sequences
quickly (though the resulting sequence is unweighted), and `Nt.MatchMap`
supports degenerate nucleotide matching and can provide *all* ungapped matches
(ordered by relevance) of moderately-sized query sequences in the genomic data
I was looking through (~200kbp) in milliseconds.

This project sat unfinished for years, and I felt the need to clean it up and
release it. I hope a new generation of young scientists and developers will be
help develop and permeate small, focused, well-documented open source JavaScript
libraries to create beautiful online experiences. :)

## The Future, p-Values and Over / Under-Represented Sequences

Though it is outside of the scope of this project, I have done some work on
determining whether sequences in a genome are over- or under-represented in a
genome based on the statistical likelihood of finding a specific frequency of
*k* matches given the ATGC content of the genome and search sequence. (i.e.
How many times would I expect to find sequence identity of 15 (*k*) of 20
nucleotides if I aligned my query sequence at every possible location in a
genome?)

*Between non-degenerate sequences*, you can approximate each alignment check between
two nucleotides as a [Bernoulli trial](http://en.wikipedia.org/wiki/Bernoulli_trial),
where your probability of success (a match) is based upon the chance of randomly
matching a nucleotide from your query sequence with your search sequence (for
evenly-distributed ATGC content this is 0.25).

You can calculate the probability of matching two nucleotides for your input
sequences by just calculating a sum of probabilities:

```
  Pr(match) = (Pr(SeqA, 'A') * Pr(SeqB, 'A')) +
    (Pr(SeqA, 'T') * Pr(SeqB, 'T')) +
    (Pr(SeqA, 'G') * Pr(SeqB, 'G')) +
    (Pr(SeqA, 'C') * Pr(SeqB, 'C'));
```

Where `Pr(SeqA, 'A')` would be the fractional A content of SeqA. (The
probability of randomly choosing an 'A' nucleotide in SeqA). (This is available
from `Nt.Seq#fractionalContentATGC`).

You can then calculate the probability of getting exactly *k* matches on any
one alignment (say 15 of 20 for a length-20 query sequence) using the
Probability Mass Function of a [Binomial Distribution](http://en.wikipedia.org/wiki/Binomial_distribution).

I've written an approximation for calculating the binomial distribution
probability mass function in JavaScript as follows:

**p** is the probability of a match between two randomly selected nucleotides
  (calculated above).

**n** is the number of trials (the length of your query sequence)

**k** should be your number of matches.

```javascript
function binomialPMF(p, n, k) {

  /*
    k = # of matches
    n = # of trials (length of query sequence)
    p = probability of success on a given trial
  */

  if (p === 0) {
    return 0;
  }

  if (p === 1) {
    return k === n ? 1 : 0;
  }

  // use symmetry
  if (k > (n / 2)) {
    k = n - k;
    p = 1 - p;
  };

  /*
    Binomial PMF:

      (n! / (k! * (n - k)!)) * p^k * (1 - p)^(n - k)

    Take the natural logarithm so we can add floats instead of multiply ints
    Lose some sensitivity, but if we don't, JS will overflow Number type

      log(n! / (k! * (n - k)!)) + (k * log(p)) + ((n - k) * log(1 - p))

  */
  var r = logBinomial(n, k) + (k * Math.log(p)) + ((n - k) * Math.log(1 - p));

  return Math.exp(r);

}

function logBinomial(n, k) {

  var r = 0;
  var i;

  /*

    (n! / (k! * (n - k)!)) can be represented as
    Product (i = (n - k + 1) to n): ( i / (n - i + 1) )

    i.e. n = 5, k = 2
      5! / (2! * 3!) = (5 * 4) / (2 * 1) = (4/2) * (5/1)

    Can be represented in log form as
    Sum (i = (n - k + 1) to n): ( log(i) - log(n - i + 1) )

  */

  for (i = n - k + 1; i <= n; i++) {
    r += Math.log(i) - Math.log(n - i + 1);
  }

  return r;

};
```

You can use `Nt.MatchMap#matchFrequencyData()` to view your match frequencies.
You can calculate the probability of finding that many matches on a given
random alignment trial by using `binomialPMF(probability_match,
matchFrequencyData[i], querySeq.size())`. (Where i is the number of matches).
We can then approximate the number of *expected* frequencies for each match
amount by multiplying this by `searchSeq.size() + querySeq.size()` (the number
of actual trials, `Nt.MatchMap` uses negative alignment offsets) by your
probability result from `binomialPMF`.

I have not included this work in the library at present time, as it represents
only a preliminary entry into determining the statistical significance of
sequence match count frequencies. It is nowhere near complete, and if anybody
can offer additional insight it would be great to extend the library further
to offer useful p-values to scientists. It is important to note that this
approach only provides a useful model when mapping and comparing two
*non-degenerate* sequences.

## Acknowledgements

Thanks for reading. Hope it's helpful!
This library is MIT-licensed and completely open source. Use it (and any part
of it) wherever you'd like, but credit is always appreciated. :)

You can feel free to follow me on Twitter:

[@keithwhor](http://twitter.com/keithwhor)

Check out my other projects on GitHub:

[github.com/keithwhor](http://github.com/keithwhor)

Or check out my personal website:

[keithwhor.com](http://keithwhor.com)
