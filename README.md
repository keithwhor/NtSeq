# NtSeq

Welcome! **NtSeq** is a Nucleotide sequence manipulation and analysis library for Node and the Browser. It's built with the developer (and scientist) in mind with simple, readable methods that are part of the standard molecular biologist's vocabulary.

Additionally, **NtSeq** comes with a novel, highly optimized exhaustive sequence mapping / comparison tool known as **MatchMap** that allows you to *find all ungapped alignments between two degenerate nucleotide sequences, ordered by the number of matches*. Also provided is a list of results showing the number of each match count, which can be useful for determining if certain sequences or variations are over-represented in a target genome. (P-values, unfortunately, are out of the scope of this project.)

**MatchMap** uses bit operations to exhaustively scan a search sequence at a rate of over 10x faster than a standard naive alignment implementation that uses string comparisons. It can run at a rate of **approximately 500,000,000 nucleotide comparisons per second** on a 2.4GHz processor. Benchmarks are included in this repository which can be easily run from the command line using node / npm. :)

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

```
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
