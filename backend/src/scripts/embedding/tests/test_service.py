
import pytest
import subprocess
import json
import time

# Integration Test for the Service Wrapper
# We test the service as a black box via stdin/stdout interaction, similar to how Node.js communicates with it.

SERVICE_PATH = "src/scripts/embedding/service.py"

@pytest.fixture(scope="module")
def service_process():
    """
    Spawns the service process and waits for readiness.
    Yields the process object.
    Kills it after tests.
    """
    proc = subprocess.Popen(
        ["python3", SERVICE_PATH],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1 # Line buffered
    )
    
    # Wait for ready signal
    try:
        if proc.stdout:
            line = proc.stdout.readline()
            data = json.loads(line)
            assert data.get("status") == "ready"
    except Exception as e:
        proc.kill()
        pytest.fail(f"Service failed to start: {e}")

    yield proc
    
    proc.terminate()
    proc.wait()

def test_embedding_generation(service_process):
    """
    Test basic embedding generation.
    """
    payload = json.dumps({"text": "Hello world", "task": "text-matching"}) + "\n"
    service_process.stdin.write(payload)
    service_process.stdin.flush()
    
    line = service_process.stdout.readline()
    data = json.loads(line)
    
    assert "vector" in data
    assert len(data["vector"]) > 0
    assert isinstance(data["vector"][0], float)

def test_invalid_json(service_process):
    """
    Test robustness against garbled input.
    """
    service_process.stdin.write("INVALID JSON\n")
    service_process.stdin.flush()
    
    line = service_process.stdout.readline()
    data = json.loads(line)
    
    assert "error" in data
    assert "Invalid JSON" in data["error"]

def test_schema_validation(service_process):
    """
    Test Pydantic validation (missing text).
    """
    payload = json.dumps({"task": "text-matching"}) + "\n" # Missing text
    service_process.stdin.write(payload)
    service_process.stdin.flush()
    
    line = service_process.stdout.readline()
    data = json.loads(line)
    
    assert "error" in data
    assert "Validation Error" in data["error"]

