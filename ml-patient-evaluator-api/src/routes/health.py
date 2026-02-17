from flask import Blueprint, jsonify
from src.services.state import performance_metrics, get_metrics_snapshot
from src.services.inference_service import load_model


bp = Blueprint("health", __name__)
_model = load_model()


@bp.route("/health", methods=["GET"])
def health():
    status = {
        "status": "healthy" if _model is not None else "unhealthy",
        "model_loaded": _model is not None,
        "service": "ML Patient Evaluator API",
        "version": "1.0.0",
        **get_metrics_snapshot(),
    }
    return jsonify(status), (200 if _model is not None else 503)


