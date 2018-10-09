---
layout: default
img: voynich
img_link: http://en.wikipedia.org/wiki/Voynich_manuscript 
caption: The Voynich manuscript
title: Homework 4 | NMT
active_tab: homework
---

<span class="text-muted">Homework 4:</span> NMT
=============================================================

Due  October 25th, 2018 at noon


In this assignment, you will be building a sequence to sequence neural machine translation model. 


Getting Started
---------------
You can get the starter code for this assignment here: 

    git clone https://github.com/thompsonb/601.468_HW4.git

In this assignment, you will be building a basic NMT model with attention. In the next assignment you will be creating extensions and adding speedups. Your next assignment will build upon this one. 

This code is based on the [tutorial by Sean Robertson](https://github.com/spro/practical-pytorch) found [here](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html). 
Students __MAY NOT__ view that tutorial or use it as a reference in any way. 


The Task
--------

Your task is to implement [this paper](https://arxiv.org/pdf/1409.0473.pdf), which describes neural machine translation with attention. 
As in the paper, you should also write the visualization for the attention mechanism and discuss selected plots in your writeup. 

The starter code for this assignment is written in PyTorch, a framework for neural networks. 


INSTALL_NOTES.txt includes the instructions to install PyTorch inside a conda environment. We have provided instructions that are tested on the [cs ugradx machine](https://support.cs.jhu.edu/wiki/Obtaining_CS_Computer_Accounts) (which currently runs Fedora release 27). We have also tested this assignment on Ubuntu 14.04.



The primary file for this assignment is seq2seq.py
Once you have installed PyTorch, you can view the arguments by running.

    python seq2seq.py -h

The arguments have reasonable default values for training the initial system (e.g. the file paths to the data should not need to changed). You can inspect the defaults in the code. 

One argument you should note is the load_checkpoint argument. This allows you to load in a model that was generated in a previous training run (which may be useful if you kill your training script part way through).

The portions of the code you will need to fill in are denoted by "*** YOUR CODE HERE ***". Further instructions and references are also in the provided code.


Ground Rules
------------

* This code is based on the [tutorial by Sean Robertson](https://github.com/spro/practical-pytorch) found [here](https://pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html). 
Students __MAY NOT__ view that tutorial or use it as a reference in any way.  
* Don't wait till the last minute, this assignment is longer than the previous.
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
     exactly. Give the dev scores for each modification/algorithm, and the test score for your final choice.
     This should also include some analysis of your attention visualization. 
*  You may not use (and should not need) any other data than what we provide. Neural machine translation software including (but not limited to)
   OpenNMT, AWS Sockeye, or Marian,  is off-limits. You may of course inspect 
   these systems if it helps you understand how they work. But be warned: they are
   generally quite complicated because they provide a great deal of other
   functionality that is not the focus of this assignment.
   If you aren't sure whether something is permitted, 
   ask us. 

