from datetime import datetime
from flask import Blueprint, jsonify
from src.services.state import get_metrics_snapshot, reset_metrics


bp = Blueprint("metrics", __name__)


@bp.route("/metrics", methods=["GET"])
def metrics():
    snapshot = get_metrics_snapshot()
    payload = {
        "service": "ML Patient Evaluator API",
        "timestamp": datetime.now().isoformat(),
        "performance": {
            "total_requests": snapshot["total_requests"],
            "successful_predictions": snapshot["successful_predictions"],
            "failed_predictions": snapshot["failed_predictions"],
            "success_rate": snapshot["success_rate"],
            "average_response_time_ms": snapshot["average_response_time_ms"],
        },
        "uptime_seconds": snapshot["uptime_seconds"],
    }
    return jsonify(payload)


@bp.route("/metrics/reset", methods=["POST"])
def metrics_reset():
    reset_metrics()
    return jsonify({"message": "Metrics reset successfully"})


