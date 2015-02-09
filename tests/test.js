var Nt = require('../lib/nt.js');
var test = require('./test_object.js');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATG');

  return a.size() === 7;

}, 'Sequence got correct size (7)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');

  return a.size() === 8;

}, 'Sequence got correct size (8)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.size() === 9;

}, 'Sequence got correct size (9)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATG');

  return a.sequence() === 'ATGCATG';

}, 'Sequence loaded properly (7)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');

  return a.sequence() === 'ATGCATGC';

}, 'Sequence loaded properly (8)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.sequence() === 'ATGCATGCA';

}, 'Sequence loaded properly (9)');

test.add(function() {

  var a = new Nt.Seq('RNA').read('ATGCATGCA');

  return a.sequence() === 'AUGCAUGCA';

}, 'Sequence loaded as RNA and output properly');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATG');

  return a.complement().sequence() === 'CATGCAT';

}, 'Sequence got correct complement (7)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');

  return a.complement().sequence() === 'GCATGCAT';

}, 'Sequence got correct complement (8)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.complement().sequence() === 'TGCATGCAT';

}, 'Sequence got correct complement (9)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');
  var b = new Nt.Seq().read('ATGCATGC');

  return a.equivalent(b);

}, 'Sequence equivalency true positive');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');
  var b = new Nt.Seq().read('ATGCATGT');

  return !a.equivalent(b);

}, 'Sequence equivalency true negative');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.replicate().sequence() === 'ATGCATGCA';

}, 'Replication works with no parameters for length 9 sequence');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.replicate(1).sequence() === 'TGCATGCA';

}, 'Replication works with one parameter (offset 1) for length 9 sequence');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.replicate(0, 8).sequence() === 'ATGCATGC';

}, 'Replication works with (0, 8) for length 9 sequence');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.replicate(7, 2).sequence() === 'CA';

}, 'Replication works with (7, 2) for length 9 sequence');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.replicate(0, 8).sequence() === 'ATGCATGC';

}, 'Replication works for (0, 8) of length 9 sequence');

test.add(function() {

  var a = new Nt.Seq().read('ATGC');
  var b = new Nt.Seq().read('TCAG');

  return a.polymerize(b).sequence() === 'ATGCTCAG';

}, 'Sequence polymerization gives correct results (4, 4)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCA');
  var b = new Nt.Seq().read('TCAG');

  return a.polymerize(b).sequence() === 'ATGCATCAG';

}, 'Sequence polymerization gives correct results (5, 4)');

test.add(function() {

  var a = new Nt.Seq().read('ATGC');
  var b = new Nt.Seq().read('TCAG');

  return a.insertion(b, 0).sequence() === 'TCAGATGC';

}, 'Sequence insertion gives correct results (length 4 at 0)');

test.add(function() {

  var a = new Nt.Seq().read('ATGC');
  var b = new Nt.Seq().read('TCAG');

  return a.insertion(b, 1).sequence() === 'ATCAGTGC';

}, 'Sequence insertion gives correct results (length 4 at 1)');

test.add(function() {

  var a = new Nt.Seq().read('ATGC');
  var b = new Nt.Seq().read('TCAGT');

  return a.insertion(b, 0).sequence() === 'TCAGTATGC';

}, 'Sequence insertion gives correct results (length 5 at 0)');

test.add(function() {

  var a = new Nt.Seq().read('ATGC');
  var b = new Nt.Seq().read('TCAGT');

  return a.insertion(b, 1).sequence() === 'ATCAGTTGC';

}, 'Sequence insertion gives correct results (length 5 at 1)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.deletion(0, 1).sequence() === 'TGCATGCA';

}, 'Deletion works for offset 0, length 1');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.deletion(0, 2).sequence() === 'GCATGCA';

}, 'Deletion works for offset 0, length 2');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.deletion(1, 2).sequence() === 'ACATGCA';

}, 'Deletion works for offset 1, length 2');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.deletion(1, 7).sequence() === 'AA';

}, 'Deletion works for offset 1, length 7');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCA');

  return a.deletion(8, 1).sequence() === 'ATGCATGC';

}, 'Deletion works for offset 8, length 1');

test.add(function() {

  var a = new Nt.Seq().read('ATG');

  return a.repeat(1).sequence() === 'ATG';

}, 'Repeat works for length 3 sequence, repeated 1x');

test.add(function() {

  var a = new Nt.Seq().read('ATG');

  return a.repeat(2).sequence() === 'ATGATG';

}, 'Repeat works for length 3 sequence, repeated 2x');

test.add(function() {

  var a = new Nt.Seq().read('ATG');

  return a.repeat(3).sequence() === 'ATGATGATG';

}, 'Repeat works for length 3 sequence, repeated 3x');

test.add(function() {

  var a = new Nt.Seq().read('ATG');

  return a.repeat(17).sequence() === 'ATGATGATGATGATGATGATGATGATGATGATGATGATGATGATGATGATG';

}, 'Repeat works for length 3 sequence, repeated 17x');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');
  var b = new Nt.Seq().read('AACCATNC');

  return a.mask(b).sequence() === 'A--CATGC';

}, 'Sequence masked properly');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGC');
  var b = new Nt.Seq().read('AACCATNC');

  return a.cover(b).sequence() === 'AWSCATNC';

}, 'Sequence covered properly');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGC');

  var content = a.content();
  return content['A'] === 3 &&
    content['T'] === 3 &&
    content['G'] === 3 &&
    content['C'] === 3;

}, 'Sequence content read correctly (3 each)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  var content = a.content();
  return content['A'] === 4 &&
    content['T'] === 4 &&
    content['G'] === 4 &&
    content['C'] === 4;

}, 'Sequence content read correctly (4 each)');

test.add(function() {

  var a = new Nt.Seq().read('AT-GCATGCATGCATGC--NW');

  var content = a.content();
  return content['A'] === 4 &&
    content['T'] === 4 &&
    content['G'] === 4 &&
    content['C'] === 4 &&
    content['-'] === 3 &&
    content['N'] === 1 &&
    content['W'] === 1;

}, 'Sequence content read correctly (contains degenerate NTs)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  var content = a.fractionalContent();
  return content['A'] === 0.25 &&
    content['T'] === 0.25 &&
    content['G'] === 0.25 &&
    content['C'] === 0.25;

}, 'Sequence fractional content read correctly (4 each, 0.25)');

test.add(function() {

  var a = new Nt.Seq().read('WWWWNNNN');

  var content = a.contentATGC();
  return content['A'] === 3 &&
    content['T'] === 3 &&
    content['G'] === 1 &&
    content['C'] === 1;

}, 'Sequence ATGC (average) content read correctly');

test.add(function() {

  var a = new Nt.Seq().read('WWWWNNNN');

  var content = a.fractionalContentATGC();
  return content['A'] === 0.375 &&
    content['T'] === 0.375 &&
    content['G'] === 0.125 &&
    content['C'] === 0.125;

}, 'Sequence ATGC (average) fractional content read correctly');

test.add(function() {

  var a = new Nt.Seq().read('ATG');

  return a.translate() === 'M';

}, 'Sequence translated correctly (one AA)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translate() === 'MHACM';

}, 'Sequence translated correctly (no parameters)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translate(1) === 'CMHAC';

}, 'Sequence translated correctly (offset 1 nt)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translate(1, 7) === 'CM';

}, 'Sequence translated correctly (offset 1 nt, length 7 nts)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translate(2) === 'ACMH';

}, 'Sequence translated correctly (offset 2 nt)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translate(2, 7) === 'AC';

}, 'Sequence translated correctly (offset 2 nt, length 7 nts)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translateFrame() === 'MHACM';

}, 'Sequence translated frame correctly (no parameters)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translateFrame(0, 1) === 'HACM';

}, 'Sequence translated frame correctly (frame 0, offset 1 AA)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translateFrame(0, 1, 2) === 'HA';

}, 'Sequence translated frame correctly (frame 0, offset 1 AA, length 2 AA)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translateFrame(1, 1, 2) === 'MH';

}, 'Sequence translated frame correctly (frame 1, offset 1 AA, length 2 AA)');

test.add(function() {

  var a = new Nt.Seq().read('ATGCATGCATGCATGC');

  return a.translateFrame(2, 1, 2) === 'CM';

}, 'Sequence translated frame correctly (frame 2, offset 1 AA, length 2 AA)');

test.add(function() {

  var a = new Nt.Seq().loadFASTA(__dirname + '/data/sequence.fasta');
  var b = new Nt.Seq().read('TCTTATTTGTGCTGTTTATT');

  // Sequence target in Bacteriophage T4, gene 46
  // [33302..34984]

  var matchMap = a.mapSequence(b);

  var testData = [
    234,
    1571,
    5942,
    14035,
    24226,
    31360,
    32021,
    26118,
    17738,
    9439,
    4181,
    1509,
    418,
    112,
    15,
    3,
    0,
    0,
    0,
    0,
    1
  ];

  var isCorrect = true;
  var matchFrequencyData = matchMap.matchFrequencyData();

  for (var i = 0; i < matchFrequencyData.length; i++) {
    if (matchFrequencyData[i] !== testData[i]) {
      isCorrect = false;
      break;
    }
  }

  return isCorrect &&
    matchMap.best().position === 34767 &&
    matchMap.best().matches === 20;

}, 'mapSequence successfully found correct match scores, loaded from .fasta');

test.add(function() {

  var a = new Nt.Seq().load4bnt(__dirname + '/data/sequence.4bnt');
  var b = new Nt.Seq().read('TCTTATTTGTGCTGTTTATT');

  // Sequence target in Bacteriophage T4, gene 46
  // [33302..34984]

  var matchMap = a.mapSequence(b);

  var testData = [
    234,
    1571,
    5942,
    14035,
    24226,
    31360,
    32021,
    26118,
    17738,
    9439,
    4181,
    1509,
    418,
    112,
    15,
    3,
    0,
    0,
    0,
    0,
    1
  ];

  var isCorrect = true;
  var matchFrequencyData = matchMap.matchFrequencyData();

  for (var i = 0; i < matchFrequencyData.length; i++) {
    if (matchFrequencyData[i] !== testData[i]) {
      isCorrect = false;
      break;
    }
  }

  return isCorrect &&
    matchMap.best().position === 34767 &&
    matchMap.best().matches === 20;

}, 'mapSequence successfully found correct match scores, loaded from .4bnt');

test.run();
