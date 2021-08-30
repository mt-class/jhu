#!/usr/bin/env python
import optparse
import sys

optparser = optparse.OptionParser()
optparser.add_option("-d", "--data", dest="train", default="data/hansards", help="Data filename prefix (default=data)")
optparser.add_option("-e", "--english", dest="english", default="e", help="Suffix of English filename (default=e)")
optparser.add_option("-f", "--french", dest="french", default="f", help="Suffix of French filename (default=f)")
optparser.add_option("-a", "--alignments", dest="alignment", default="a", help="Suffix of gold alignments filename (default=a)")
optparser.add_option("-n", "--num_display", dest="n", default=sys.maxsize, type="int", help="Number of alignments to display")
(opts, args) = optparser.parse_args()
f_data = "%s.%s" % (opts.train, opts.french)
e_data = "%s.%s" % (opts.train, opts.english)
a_data = "%s.%s" % (opts.train, opts.alignment)
    
(size_a, size_s, size_a_and_s, size_a_and_p) = (0.0,0.0,0.0,0.0)
for (i, (f, e, g, a)) in enumerate(zip(open(f_data), open(e_data), open(a_data), sys.stdin)):
  fwords = f.strip().split()
  ewords = e.strip().split()
  sure = set([tuple(map(int, x.split("-"))) for x in filter(lambda x: x.find("-") > -1, g.strip().split())])
  possible = set([tuple(map(int, x.split("?"))) for x in filter(lambda x: x.find("?") > -1, g.strip().split())])
  alignment = set([tuple(map(int, x.split("-"))) for x in a.strip().split()])
  size_a += len(alignment)
  size_s += len(sure)
  size_a_and_s += len(alignment & sure)
  size_a_and_p += len(alignment & possible) + len(alignment & sure)
  if (i<opts.n):
    sys.stdout.write("  Alignment %i  KEY: ( ) = guessed, * = sure, ? = possible\n" % i)
    sys.stdout.write("  ")
    for j in ewords:
      sys.stdout.write("---")
    sys.stdout.write("\n")
    for (i, f_i) in enumerate(fwords):
      sys.stdout.write(" |")
      for (j, _) in enumerate(ewords):
        (left,right) = ("(",")") if (i,j) in alignment else (" "," ")
        point = "*" if (i,j) in sure else "?" if (i,j) in possible else " "
        sys.stdout.write("%s%s%s" % (left,point,right))
      sys.stdout.write(" | %s\n" % f_i)
    sys.stdout.write("  ")
    for j in ewords:
      sys.stdout.write("---")
    sys.stdout.write("\n")
    for k in range(max(map(len, ewords))):
      sys.stdout.write("  ")
      for word in ewords:
        letter = word[k] if len(word) > k else " "
        sys.stdout.write(" %s " % letter)
      sys.stdout.write("\n")
    sys.stdout.write("\n")

precision = size_a_and_p / size_a
recall = size_a_and_s / size_s
aer = 1 - ((size_a_and_s + size_a_and_p) / (size_a + size_s))
sys.stdout.write("Precision = %f\nRecall = %f\nAER = %f\n" % (precision, recall, aer))

for _ in (sys.stdin): # avoid pipe error
  pass
