# NtSeq

Welcome! **NtSeq** is a degenerate Nucleotide sequence manipulation and analysis library for Node and the Browser. It's built with the developer (and scientist) in mind with simple, readable methods that are part of the standard molecular biologist's vocabulary.

Additionally, **NtSeq** comes with a novel, highly optimized exhaustive sequence mapping / comparison tool known as **MatchMap** that allows you to *find all ungapped alignments between two degenerate nucleotide sequences, ordered by the number of matches*. Also provided is a list of results showing the number of each match count, which can be useful for determining if certain sequences or variations are over-represented in a target genome. (P-values, unfortunately, are out of the scope of this project.)

**MatchMap** uses bit operations to exhaustively scan a search sequence at a rate of up to 10x faster than a standard naive alignment implementation that uses string comparisons. It can run at a rate of up to **approximately 500,000,000 nucleotide comparisons per second** on a 2.4GHz processor.

Tests and benchmarks are included in this repository which can be easily run from the command line using node / npm. :)

New to bioinformatics, or never played with a nucleotide sequence before?
Check out [Nucleic Acid Notation](http://en.wikipedia.org/wiki/Nucleic_acid_notation)
to get started.

## Installation

**NtSeq** is available as a node package, and can be installed with:

```
$ npm install ntseq
```

You can use NtSeq in your node project by using:

```javascript
var Nt = require('ntseq');
```

In order to use NtSeq on a webpage, download `ntseq.js` from this repository and include it in a script tag, like so (assuming it is in the same directory as your page):

```javascript
<script src="ntseq.js"></script>
```

The `Nt` namespace contains two constructor methods, `Nt.Seq` and `Nt.MatchMap`. You can use these by calling:

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

## Why NtSeq?

JavaScript is, at present, the most popular language in the world. This privilege is not without merit. The language is easily accessible, requiring only a text editor and a web browser to dive into. JavaScript is robust and has a giant community, eager to build the next great tools.

It's the mission of NtSeq to encourage scientific web developers and help provide their community community with better libraries for web application development.

Even from a scientific computing standpoint, Google's work on V8 (the JavaScript engine) has been fantastic. The performance benchmark that **NtSeq** has been able to hit have performed identically (if not better) to previous attempts at native implementations of **MatchMap**'s bit operation algorithm.

## What can I do with NtSeq?

- Quickly scan genomic data for target sequences or ungapped relatives using `.mapSequence()`

- Grab the 5' -> 3' complement of a sequence with `.complement()`

- Manipulate sequences easily using `.replicate()`, `.deletion()`, `.insertion()`, `.repeat()` and `.polymerize()`

- Translate your nucleotide sequences in a single line of code using `.translate()` or `.translateFrame()`

- Quickly determine AT% content with `.content()` or `.fractionalContent()`

- Grab *approximate* AT% content for degenerate sequences using `.contentATGC()` or `.fractionalContentATGC()`

- Load FASTA files into memory from your machine (node) with `.loadFASTA()` or from a string if you use an external AJAX request (web) using `.readFASTA()`

- Save large sequences for easy accession in the future using a new filetype, `.4bnt` that will cut your FASTA file sizes in half with `.save4bnt()` and `.load4bnt()` (**node only**)

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
var gcSeq = new Nt.Seq().read('GCGC');

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
var complementMe = new Nt.Seq().read('CCAATT');
// is 'AATTGG'
complementMe.complement().sequence();
```

Translating sequences to amino acid sequences is trivial...

```javascript
var seq = new Nt.Seq().read('ATGCCCGACTGCA');
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
var seq = new Nt.Seq().read('ATGCCCGACTGCA');
var querySeq = new Nt.Seq().read('CCCG');
var map = seq.mapSequence(querySeq);
map.best().position; // === 3
```

Hmm, what about degenerate matching, 'ASTG'?

```javascript
var seq = new Nt.Seq().read('ATGCCCGACTGCA');
var querySeq = new Nt.Seq().read('ASTG');
var map = seq.mapSequence(querySeq);
map.best().position; // === 7
```

What if there are no perfect matches?

```javascript
var seq = new Nt.Seq().read('ATGCCCGACTGCA');
var querySeq = new Nt.Seq().read('CCCW');
var map = seq.mapSequence(querySeq);
map.best().position; // === 3
map.best().matches; // === 3
map.best().alignment().sequence(); // === 'CCCG'

// this is the actual nucleotides that match, gaps for non-matches
map.best().alignmentMask().sequence(); // === 'CCC-'

// this is the optimistic sequence that could match both
map.best().alignmentCover().sequence(); // === 'CCCD'

// .matchCount provides the number of times a certain number of matches were
//    found. In this example, the sequence didn't find any matches at 6
//    locations. Keep in mind the sequence attempts to align outside of the
//    upper and lower bounds of the search space.
//      i.e.     ATGC
//             CCCW
map.matchCount(); // === [ 6, 8, 3, 2, 0 ]
```

## Library Reference

### Nt.Seq

#### (constructor) Nt.Seq( [optional String seqType] )

Construct a new Nt.Seq object. `seqType` can be `'DNA'` or `'RNA'`.

```javascript
var seq = new Nt.Seq();
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
var seq = new Nt.Seq().read('ATGC');
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
var seqA = new Nt.Seq().read('ATGC');
var seqB = new Nt.Seq().read('AWTS')

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
var seqA = new Nt.Seq().read('ATGC');
var seqB = new Nt.Seq().read('AWTS')

var seqC = seqA.cover(seqB);
seqC.sequence(); // === 'AWKS'
```

---

#### Nt.Seq#content()

returns `Object`

Returns a Object (hash table) containing the frequency counts of nucleotides,
**including degenerate nucleotides (16 results total)**.

```javascript
var seqA = new Nt.Seq().read('ATGC');

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
var seqA = new Nt.Seq().read('ATGC');

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
var seqA = new Nt.Seq().read('ATNN');

var content = seqA.fractionalContent();
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
var seqA = new Nt.Seq().read('ATNN');

var content = seqA.fractionalContent();
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

## Benchmarks and Tests

NtSeq has a number of integration tests that you can access with

```
$ npm test
```

and run benchmarks with

```
$ npm run benchmark
```

You should get an output that looks (roughly) like the following (taken
  Feb 7th, 2015 on a 2.4GHz processor).

**naive** refers to a simple string implementation of exhaustive alignment
mapping (no heuristics), and **search** refers to the **MatchMap** optimized
bit up alignment mapping, providing the same result (no heuristics either!).

The scores (lower is better) are calculated by dividing the total execution time
  in nanoseconds by the input size in (*m* x *n* where *m* is search (large)
  sequence length and *n* is query sequence length).

The benchmark titles indicate the total size of the search space, and what
percent identity (similarity) the sequences have to one another.

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
