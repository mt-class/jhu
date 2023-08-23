# -*- coding: utf-8 -*-

import unittest
import random
from gradescope_utils.autograder_utils.decorators import leaderboard
from subprocess import run, PIPE


class TestLeaderboard(unittest.TestCase):
    def setUp(self):
        out = run(["python3 score-alignments < alignment"], shell=True, stdout=PIPE, stderr=PIPE)
        results = out.stdout.decode("utf-8").split("\n")[-4:-1]
        precision = float(results[0].strip().split('=')[-1])
        recall = float(results[1].strip().split('=')[-1])
        aer = float(results[2].strip().split('=')[-1])
        self.scores = [precision, recall, aer]

    @leaderboard("AER", "asc")
    def test_aer(self, set_leaderboard_value=None):
        """Sets a leaderboard value"""
        set_leaderboard_value(self.scores[2])

    @leaderboard("Precision")
    def test_precision(self, set_leaderboard_value=None):
        """Sets a leaderboard value"""
        set_leaderboard_value(self.scores[0])

    @leaderboard("Recall")
    def test_recall(self, set_leaderboard_value=None):
        """Sets a leaderboard value"""
        set_leaderboard_value(self.scores[1])
