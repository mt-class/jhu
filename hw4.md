---
layout: default
img: voynich
img_link: http://en.wikipedia.org/wiki/Voynich_manuscript 
caption: The Voynich manuscript
title: Homework 5 | NMT
active_tab: homework
---

<span class="text-muted">Homework 5:</span> NMT
=============================================================

Due  Novemeber 8th, 2018 at noon


In this assignment, you will be improving your sequence to sequence neural machine translation model. 


Getting Started
---------------
You will be starting with your homework assignment with your code from Homework 4. 

In this assignment, you will be improving your basic NMT model with attention and adding speedups. 

This code is based on the [tutorial by Sean Robertson](https://github.com/spro/practical-pytorch) found [here](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html). 
Students __MAY NOT__ view that tutorial or use it as a reference in any way. 


The Task
--------
You may now use the built-in PyTorch LSTM rather than your own. 


For this assignment, you will be improving your Machine Translation system. 
Some things you can try include:
* Implementing batching (http://www.aclweb.org/anthology/W17-3208)
* Implementing beam search (described here: https://arxiv.org/pdf/1211.3711.pdf, http://papers.nips.cc/paper/5346-sequence-to-sequence-learning-with-neural-networks.pdf) 

* Character Aware encoder (there are several ways of doing this, here is one: http://anthology.aclweb.org/P16-2058 but feel free to try something else creative!)
 
* Implementing Different types of Attention (http://aclweb.org/anthology/D15-1166)

* Other improvements:
  * A good way to think about potential improvements is to look at your output and see what problems there are. 
  * You can also take a look at recent papers for inspiration about what problems to tackle (https://aclanthology.info/). 
  * If you are not sure if something is a valid extension, please post on piazza. 
 

Please be sure sure to describe your extensions in your write up. Please describe what extensions you tried and what experiments you ran. We are interested in your analysis in addition to your implementation. 
This is a very small data set designed to train quickly on cpu, so some extensions may not improve performance on this data set. That's ok, please still analyze your results. You are welcome to try training your system on different data if you would like. If you are interested in trying your system on a different language pair that has some property: complex morphology, reordering, etc,  post on piazza and we help you try to find one. 



Ground Rules
------------

* This code is based on the [tutorial by Sean Robertson](https://github.com/spro/practical-pytorch) found [here](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html). 
Students __MAY NOT__ view that tutorial or use it as a reference in any way.  
* You can work in independently or in groups of up to three, under these 
  conditions: 
  1. You must announce the group publicly on piazza.
  1. You agree that everyone in the group will receive the same grade on the assignment. 
  1. You can add people or merge groups at any time before the assignment is
     due. **You cannot drop people from your group once you've added them.**
  We encourage collaboration, but we will not adjudicate Rashomon-style 
  stories about who did or did not contribute.
 1. You must submit one assignment per group on Gradescope, and indicate your collaborators once you upload the files.  
 * You must turn in three things to [Gradescope](https://www.gradescope.com/):
  1. Your translations of the entire testset. You can upload new output as often as you like, up until the assignment deadline. **Your translated file must be named `translations`.**
  1. Your code, uploaded to [Gradescope](https://www.gradescope.com/). 
  1. A clear, mathematical description of your algorithm and its motivation
     written in scientific style, uploaded to [Gradescope](https://www.gradescope.com/). This needn't be long, but it should be
     clear enough that one of your fellow students could re-implement it 
     exactly. Please disucuss how your modification(s) impact performance and analyze the results.
*  Neural machine translation software including (but not limited to)
   OpenNMT, AWS Sockeye, or Marian,  is off-limits. You may of course inspect 
   these systems if it helps you understand how they work. But be warned: they are
   generally quite complicated because they provide a great deal of other
   functionality that is not the focus of this assignment.
   If you aren't sure whether something is permitted, 
   ask us. 
* You are welcome to try training your system on more data if you would like, though the provided dataset was chosen to have a small vocabulary and short sentences so that the MT systems would train quickly. If you are interested in trying your system on a different language pair that has some property: complex morphology, reordering, etc,  post on piazza and we help you try to find one. 

