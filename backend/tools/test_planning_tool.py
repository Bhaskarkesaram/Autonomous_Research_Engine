import os
import json
import pytest

from backend.tools import planning_tool


def make_fake_response(content: str, status_code: int = 200):
    class Fake:
        def __init__(self):
            self.status_code = status_code

        def json(self):
            return content

    return Fake()


def test_default_model_env(monkeypatch):
    # clear env and set a custom model
    monkeypatch.delenv("OPENROUTER_MODEL", raising=False)
    assert planning_tool.OPENROUTER_MODEL == "mistralai/mistral-7b-instruct"

    monkeypatch.setenv("OPENROUTER_MODEL", "test-model")
    # reload module to pick up change
    monkeypatch.reload_module(planning_tool)
    assert planning_tool.OPENROUTER_MODEL == "test-model"


def test_write_todos_parses_json(monkeypatch):
    sample_tasks = [
        {"id": 1, "title": "A", "description": "B", "status": "pending"}
    ]
    fake_content = {"choices": [{"message": {"content": json.dumps(sample_tasks)}}]}

    def fake_post(url, headers, json, timeout):
        return make_fake_response(fake_content)

    monkeypatch.setattr(planning_tool.requests, "post", fake_post)

    result = planning_tool.write_todos("do something")
    assert result == sample_tasks


def test_write_todos_error_feedback(monkeypatch):
    # simulate 404 error from OpenRouter
    err = {"error": {"message": "No endpoints found for foo", "code": 404}}
    def fake_post(url, headers, json, timeout):
        return make_fake_response(err, status_code=404)

    monkeypatch.setattr(planning_tool.requests, "post", fake_post)

    with pytest.raises(Exception) as exc:
        planning_tool.write_todos("anything")
    assert "model endpoint not found" in str(exc.value)
