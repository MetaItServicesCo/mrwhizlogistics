"""Model resolution against what a Groq key can actually use."""

import pytest

from app.agent.models import NoUsableModel, is_reasoning_model, resolve


def test_prefers_configured_models_when_available():
    choice = resolve(["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"])
    assert (choice.chat, choice.fast) == ("openai/gpt-oss-120b", "openai/gpt-oss-20b")
    assert choice.fallback != choice.chat and choice.notes == []


def test_enterprise_only_llama_missing_falls_through(monkeypatch):
    from app.agent import models

    monkeypatch.setattr(models.settings, "chat_model", "llama-3.3-70b-versatile")
    monkeypatch.setattr(models.settings, "router_model", "llama-3.1-8b-instant")
    choice = resolve(["openai/gpt-oss-120b", "openai/gpt-oss-20b"])
    assert (choice.chat, choice.fast) == ("openai/gpt-oss-120b", "openai/gpt-oss-20b")
    assert len(choice.notes) == 2 and "not available to this key" in choice.notes[0]


def test_single_model_key_uses_it_for_every_role():
    choice = resolve(["openai/gpt-oss-20b"])
    assert choice.chat == choice.fast == choice.fallback == "openai/gpt-oss-20b"


def test_unknown_future_model_beats_nothing():
    choice = resolve(["vendor/brand-new-model"])
    assert choice.chat == "vendor/brand-new-model"


def test_no_chat_models_is_a_clear_error():
    with pytest.raises(NoUsableModel):
        resolve([])


def test_reasoning_models():
    assert is_reasoning_model("openai/gpt-oss-20b") and not is_reasoning_model("llama-3.1-8b-instant")
