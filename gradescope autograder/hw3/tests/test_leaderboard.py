# -*- coding: utf-8 -*-

import unittest
import random
from gradescope_utils.autograder_utils.decorators import leaderboard
from subprocess import run, PIPE


class TestLeaderboard(unittest.TestCase):
    def setUp(self):
        out = run(
            ["python3 compute-model-score-ag < translations"],
            shell=True, stdout=PIPE, stderr=PIPE
        )
        self.score = float(
            out.stdout.decode("utf-8").strip().split('\n')[-1].split(":")[-1]
        )

    @leaderboard("Score")
    def test_aer(self, set_leaderboard_value=None):
        """Sets a leaderboard value"""
        set_leaderboard_value(self.score)
