"""
led_status_server.py
Small Flask server that holds the current isolation status of each ESP32.
- isolate_windows.py (or your ML loop) calls set_status() when it isolates/reinstates a device.
- Each ESP32 polls GET /status/<device_id> and drives its LEDs based on the response.

Run this as Administrator alongside your ML pipeline / isolate_windows.py.
"""

from flask import Flask, jsonify, request
import threading

app = Flask(__name__)

# In-memory status store. device_id -> "normal" | "isolated"
# Map your 3 ESP32 device IDs here (use whatever IDs are easiest — e.g. their last IP octet)
device_status = {
    "esp32_1": "normal",
    "esp32_2": "normal",
    "esp32_3": "normal",
}

lock = threading.Lock()


@app.route("/status/<device_id>", methods=["GET"])
def get_status(device_id):
    """ESP32 polls this endpoint to know what LED state to show."""
    with lock:
        status = device_status.get(device_id, "unknown")
    return jsonify({"device_id": device_id, "status": status})


@app.route("/set_status/<device_id>/<new_status>", methods=["POST"])
def set_status(device_id, new_status):
    """Your ML/mitigation code calls this (or import set_status_internal) to update state."""
    if new_status not in ("normal", "isolated"):
        return jsonify({"error": "status must be 'normal' or 'isolated'"}), 400
    with lock:
        device_status[device_id] = new_status
    print(f"[LED SERVER] {device_id} -> {new_status}")
    return jsonify({"device_id": device_id, "status": new_status})


@app.route("/all", methods=["GET"])
def get_all():
    with lock:
        return jsonify(device_status)


def set_status_internal(device_id, new_status):
    """Call this directly from isolate_windows.py if running in the same process."""
    with lock:
        device_status[device_id] = new_status
    print(f"[LED SERVER] {device_id} -> {new_status}")


if __name__ == "__main__":
    # 0.0.0.0 so ESP32 devices on the hotspot subnet can reach it
    app.run(host="0.0.0.0", port=5000)
