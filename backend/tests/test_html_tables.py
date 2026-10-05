"""Rich-text sanitizer: pasted tables are kept, unsafe markup is still removed.

Run from backend: venv/Scripts/python.exe -m unittest tests.test_html_tables -v
"""

import unittest

from tests.site_pages_app import make_app  # noqa: F401  (sets the isolated test environment)
from app.core.html import sanitize_html


class TableSanitizingTests(unittest.TestCase):
    def test_table_structure_is_kept(self):
        html = (
            '<table><thead><tr><th colspan="2" scope="col">Truck</th></tr></thead>'
            '<tbody><tr><td rowspan="2"><p>Hot shot</p></td><td>40 ft</td></tr></tbody></table>'
        )
        out = sanitize_html(html)
        for fragment in ("<table>", "<thead>", "<tbody>", '<th colspan="2" scope="col">', '<td rowspan="2">', "<p>Hot shot</p>"):
            self.assertIn(fragment, out)

    def test_unsafe_markup_inside_tables_is_removed(self):
        html = (
            '<table style="width:100%" onclick="steal()"><tr>'
            '<td style="background:red" onmouseover="x()">A<script>alert(1)</script></td>'
            '<td><a href="javascript:alert(1)">B</a></td></tr></table>'
        )
        out = sanitize_html(html)
        for bad in ("onclick", "onmouseover", "<script", "javascript:", "style="):
            self.assertNotIn(bad, out)
        self.assertIn("<td>A</td>", out)

    def test_existing_formatting_unchanged(self):
        html = '<p>Plain <strong>bold</strong> <span style="color: #ff0000">red</span> <mark style="background-color: #fde047">hi</mark></p>'
        self.assertEqual(sanitize_html(html), html)


if __name__ == "__main__":
    unittest.main()
