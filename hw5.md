---
layout: default
img: exam
img_link: http://www.flickr.com/photos/gianellbendijo/4034021658/
caption: Image by gianellbendijo (used with permission)
title: Homework 5 | Inflection
active_tab: homework
---

<div class="alert alert-info">
  Implementation due Monday, April 28, at 6pm.
  Writeup due the following day in class.
</div>

Inflection <span class="text-muted">Challenge Problem 5</span>
==============================================================

Introduction
------------

The traditional formulation of the problems in machine
translation, from alignment to model extraction to decoding
and through evaluation, ignores completely the linguistic
phenomenon of morphology, instead treating all words as
distinct atoms. This clearly misses out on a number of
generalizations; for example, in alignment, it could be
useful to accumulate evidence across the various inflections
of a verb such as *walk*: *walk*, *walked*, *walks*, and
*walking* all likely have related translations.

The study of morphology is often split into two classes:
[inflectional](http://en.wikipedia.org/wiki/Inflection)
morphology studies how words change to reflect grammatical
properties, roles, and other information, while
[derivational](http://en.wikipedia.org/wiki/Derivation_(linguistics)))
morphology describes how words change across as they are
adapted across parts of speech. Of these, inflectional
morphology is the more important one for natural language
generation tasks such as machine translation, because
getting the right form of a word is important in generating
grammatical output.

Fortunately for the development of field, English has very
little inflectional morphology. Its inflectional morphology
encodes only
[person](http://en.wikipedia.org/wiki/Grammatical_person),
[number](http://en.wikipedia.org/wiki/Grammatical_number),
and one of two
[cases](http://en.wikipedia.org/wiki/Grammatical_case), and
the forms overlap among the possible
combinations. We can translate into English just fine
without the complexity of modeling morphology. 

However, this is not the case for many of the world's
languages. The vast number of potential word forms creates
data sparsity, which is exacerbated by the fact that
morphologically complex languages are often also
under-resourced. 

This assignment challenges you to model morphology in some
form in the generation of Czech. The setting is very simple:
you are given a training corpus of Czech sentences along
with a parallel, reduced form containing only the word
lemmas. Your task is to build a model that can produce the
fully-inflected forms given only a development test set
containing only lemmas.

Getting Started
---------------

<div class="alert alert-danger"> 
  <b>Important!</b>
  The data used in this assignment is released under the <a
  href="http://ldc.upenn.edu">LDC</a>, and cannot be
  distributed as we did for other assignments. You will need
  a CLSP account in order to complete the assignment. Our
  license agreement with the LDC stipulates that the data
  not be removed from CLSP servers, so please do your work
</div>

If you have a clone of the repository from previous
homeworks, you can update it from your working directory:

    git pull origin master

Alternatively, get a fresh copy:

    git clone https://github.com/alopez/en600.468.git

Change to the `generate` directory, and type the following
to create symlinks to the training and development data (and
please observe the warning that began this section):

    cd generate
    bash scripts/link_data.sh

You will then find two sets of parallel files under `data`:
training data (for building models) and development test
data (for testing your model). Sentences are parallel at the
line level, and the words on each line also correspond
exactly across files. The parallel files have the prefix
`train` and `dev`, and the following suffixes:

- `*.lemma` contains the lemmatized version of the data. Each
  lemma can be inflected to one or more fully inflected
  forms (that may or may not share the same surface form).

- `*.pos` contains a two-character sequence denoting each
  word's part of speech

- `*.tree` contains dependency trees, which
  organize the words into a directed tree with predicates
  generating their arguments. The tree format is described
  below.

- `*.word` contains the fully inflected form. Note that we
  provide `dev.word` to you (the grading script needs it),
  but you should not look at it or build models over it.

Scoring is on the development data (don't peek at the
results).  The `scripts/` subdirectory contains a number of
scripts, including a grader and a default implementation
that simply chooses the most likely inflection for each word:

    # Check the baseline score
    cat data/dev.lemma | ./scripts/grade data/dev.word
    # Choose the most likely inflection
    cat data/dev.lemma | ./scripts/inflect -t data/train | ./scripts/grade data/dev.word

The evaluation method is accuracy: what percentage of the
correct inflections did you choose?
    
The Challenge
-------------

Your challenge is to __improve the accuracy of the inflector
as much as possible__. The provided implementation simply
chooses the most frequent inflection computed from the 
lemma alone (with statistics gathered from the training data).

For a passing grade, it is sufficient to implement a bigram
language model of some form (conditioned on the previous
word or lemma). However, as described above, we have
provided plenty more information to you that should permit
much subtler approaches. Here are some suggestions:

* Incorporate part-of-speech tags
* Implement a bigram language model over inflected forms.
* Implement a longer n-gram model and a custom backoff
  structure that consider shorter contexts, POS tags, the
  lemma, etc
* Train your language model on more data, perhaps pulled
  from the web
* Model long-distance agreement by incorporating the labeled
  dependency structure. For example, you could build a
  bigram language model that decomposes over the dependency
  tree, instead of the immediate n-gram history

Obviously, you should feel free to pursue other ideas as
they come to you. Morphology for machine translation is an
understudied problem, so it's possible you could come up
with an idea that people have not tried before!

### POS tags and dependency trees

The `.pos` and `.tree` files contain parts of speech and
dependency trees for each sentence. Information about the
part-of-speech tags
[can be found here](https://ufal.mff.cuni.cz/pdt2.0/doc/manuals/en/a-layer/html/ch01s02.html).

Dependency trees are represented as follows. The tokens on
each line correspond to the words they share an index with,
and contain two pieces of information, depicted as
PARENT/LABEL. PARENT is the index of the word's parent word,
and LABEL is the label of the edge implicit between those
indices. Parent index 0 represents the root of the
tree. Each child selects its parent, but the edge direction
is from parent to child.

For example, consider the following lines, from the lemma,
POS, tree, and word files (plus an English gloss), respectively:

    třikrát`3 rychlý než-2 slovo
    Cv AA J, NN
    1/Adv 0/ExD 1/AuxC 3/ExD
    Třikrát rychlejší než slovo
    Three-times faster than-the-word

Line 3 here corresponds to the following dependency tree:

![Dependency tree](assets/img/hw5_dep.png)

For a list of analytical functions (labels on the edges),
[see this document](https://ufal.mff.cuni.cz/pdt2.0/doc/manuals/en/a-layer/html/ch03.html#s1-list-anal-func).

Ground Rules
------------

* You can work in independently or in groups of up to three, under these 
  conditions: 
  1. You must announce the group publicly on piazza.
  1. You agree that everyone in the group will receive the same grade on the assignment. 
  1. You can add people or merge groups at any time before the assignment is
     due. **You cannot drop people from your group once you've added them.**
  We encourage collaboration, but we will not adjudicate Rashomon-style 
  stories about who did or did not contribute.
* You must turn in three things:
  1. Your automatic judgements of the development test set (`data/dev.lemma`), uploaded to the [leaderboard submission site](http://jhumtclass.appspot.com) according to <a href="assignment0.html">the Assignment 0 instructions</a>. You can upload new output as often
     as you like, up until the assignment deadline. 
  1. Your code. Send us a URL from which we can get the code and git revision
     history (a link to a tarball will suffice, but you're free to send us a 
     github link if you don't mind making your code public). This is due at the
     deadline: when you upload your final answer, send us the code.
     You are free to extend the code we provide or roll your own in whatever
     langugage you like, but the code should be self-contained, 
     self-documenting, and easy to use. 
  1. A clear, mathematical description of your algorithm and its motivation
     written in scientific style. This needn't be long, but [it should be
     clear enough that one of your fellow students could re-implement it 
     exactly](hw-writing-exercise.html).
* You do not need any other data than what we provide. You
   are free to use any code or software you like, __except
   for those expressly intended to do morphological
   generation__.  You must write your own evaluation
   function. If you want to use part-of-speech taggers,
   syntactic or semantic parsers, machine learning
   libraries, thesauri, or any other off-the-shelf
   resources, plese feel free to do so. If you aren't sure
   whether something is permitted, ask us. If you want to do
   system combination, join forces with your classmates.

*Credits: This assignment was designed for this course by
 [Matt Post](http://cs.jhu.edu/~post). The data used in the
 assignment comes from the
 [Prague Dependency Treebank v2.0](https://ufal.mff.cuni.cz/pdt2.0/)*
