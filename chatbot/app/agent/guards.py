"""
Input and output guards around the agent.

Input: size limits and obvious prompt-injection markers (the model is also
told to ignore them; this just avoids spending a call on the worst ones).
Output: the assistant must never invent prices or transit times. Any money
amount or delivery-time promise that does not appear in the retrieved
website text is treated as made up and the answer is replaced.
"""

import re
from dataclasses import dataclass

_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_INJECTION = re.compile(
    r"(ignore (all |any )?(previous|prior|above) (instructions|prompts)|system prompt|you are now|"
    r"developer mode|jailbreak|act as (an? )?(unfiltered|dan)\b|reveal (your|the) (instructions|prompt))",
    re.I,
)
_MONEY = re.compile(r"(\$\s?\d[\d,]*(\.\d+)?|\d[\d,]*(\.\d+)?\s?(usd|dollars?)\b|\d+(\.\d+)?\s?(per|/)\s?mile)", re.I)
_TRANSIT_PROMISE = re.compile(
    r"\b(will|can|guarantee[ds]?|guaranteed to)\b[^.]{0,40}\b(arrive|deliver(ed)?|get there|be there)\b[^.]{0,30}"
    r"\b(within|in|by)\s+(\d+|one|two|three|24|48)\s*(hours?|days?|hrs?)\b",
    re.I,
)
_BOOKED = re.compile(r"\b(your (load|shipment|truck|booking) (is|has been) (booked|confirmed|scheduled))\b", re.I)


@dataclass
class InputCheck:
    ok: bool
    text: str
    reason: str | None = None


def check_input(raw: str, max_chars: int) -> InputCheck:
    text = _CONTROL.sub("", raw or "").strip()
    if not text:
        return InputCheck(False, "", "empty")
    if len(text) > max_chars:
        return InputCheck(False, text[:max_chars], "too_long")
    if _INJECTION.search(text):
        return InputCheck(False, text, "injection")
    return InputCheck(True, text)


def _numbers(text: str) -> set[str]:
    return {re.sub(r"[^\d.]", "", m.group(0)) for m in _MONEY.finditer(text)}


@dataclass
class OutputCheck:
    ok: bool
    reason: str | None = None


def check_output(answer: str, evidence: str) -> OutputCheck:
    """`evidence` is the text the answer may rely on (retrieved chunks + company facts)."""
    claimed = _numbers(answer)
    if claimed and not claimed <= _numbers(evidence):
        return OutputCheck(False, "unsupported_price")
    if _TRANSIT_PROMISE.search(answer):
        promise = _TRANSIT_PROMISE.search(answer).group(0).lower()
        if promise not in evidence.lower():
            return OutputCheck(False, "transit_promise")
    if _BOOKED.search(answer):
        return OutputCheck(False, "false_booking")
    return OutputCheck(True)
