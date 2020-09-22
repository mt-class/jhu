import unittest
from gradescope_utils.autograder_utils.decorators import weight
from subprocess import PIPE, run


class TestCheckAlignment(unittest.TestCase):

    @weight(2)
    def test_check_alignment(self):
        """Check submitted alignment"""
        out = run(["python3 check-alignments < alignment"], shell=True, stdout=PIPE, stderr=PIPE)
        if out.returncode == 1:
            print(out.stderr)
        assert out.returncode == 0

    @weight(2)
    def test_performance(self):
        """Check performance"""
        out = run(["python3 score-alignments < alignment"], shell=True, stdout=PIPE, stderr=PIPE)

        if out.returncode == 1:
            print(out.stderr)
        assert out.returncode == 0

        results = out.stdout.decode("utf-8").split("\n")[-4:-1]
        aer = float(results[2].strip().split('=')[-1])
        print(f"AER:{aer}")
        
        if aer > 0.682:
            print(f"Worse than baseline (0.682).")
            assert False
        
