import unittest
from gradescope_utils.autograder_utils.decorators import weight
from subprocess import PIPE, run


class TestDecoder(unittest.TestCase):
    def setUp(self):
        with open("data/input", 'r') as f:
            self.inputs = f.readlines()
    #    self.scores = {
    #        "decode": float('-inf'),
    #        "decode-ext": float('-inf'),
    #        "translations": float('-inf'),
    #    }

    def basic_decode(self, filename):
        """Check basic decoding"""
        out = run(
            [f"python3 {filename}"],
            shell=True, stdout=PIPE, stderr=PIPE
        )

        self.assertEqual(
            out.returncode,
            0,
            out.stderr
        )

        lines = out.stdout.decode("utf-8").strip().split('\n')

        self.assertEqual(
            len(lines),
            len(self.inputs),
            f"{filename} generates a different number of translations from input"
            f" ({len(lines)}, {len(self.inputs)})"
        )

        #out_score = run(
        #    ["python3 compute-model-score-ag"],
        #    shell=True, stdout=PIPE, stderr=PIPE, input=out.stdout
        #)

        #self.scores[filename] = float(
        #    out_score.stdout.decode("utf-8").strip().split('\n')[-1].split(":")[-1]
        #)
        #print(f"{filename}: {self.scores[filename]}")

    @weight(2)
    def test_basic_decode(self):
        """Check basic decoding"""
        self.basic_decode('decode-ext')

    @weight(2)
    def test_extended_decode(self):
        """Check extended decoding"""
        self.basic_decode('decode')

    @weight(1)
    def test_translation(self):
        """Check submitted translations"""
        with open("translations", "r") as f:
            lines = f.readlines()

        self.assertEqual(
            len(lines),
            len(self.inputs),
            "Then length of translations is different from input"
            f" ({len(lines)}, {len(self.inputs)})"
        )

        out = run(
            ["cat translations | python3 compute-model-score-ag"],
            shell=True, stdout=PIPE, stderr=PIPE
        )

        score = float(
            out.stdout.decode("utf-8").strip().split('\n')[-1].split(":")[-1]
        )

        print(f"Translation score: {score}")

        #self.assertEqual(
        #    max([self.scores['decode'], self.scores['decode-ext']]),
        #    self.scores["translations"],
        #    f"neither decode{self.scores['decode']} nor decode-ext{self.scores['decode-ext']} is able to reproduce the result"
        #)

        #print(self.scores)
