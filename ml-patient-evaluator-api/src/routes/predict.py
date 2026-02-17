import time
from flask import Blueprint, request, jsonify
from src.services.inference_service import load_model, run_inference
from src.services.state import record_request, record_success, record_failure


bp = Blueprint("predict", __name__)
_model = load_model()


@bp.route("/predict", methods=["POST"])
def predict():
    start = time.time()
    record_request()

    if _model is None:
        record_failure()
        return jsonify({"error": "Model not available. Please check server logs for model loading issues."}), 503

    data = request.get_json(silent=True)
    if not data or "inputs" not in data:
        record_failure()
        return jsonify({"error": "Missing 'inputs' field"}), 400

    inputs = data["inputs"]
    if not isinstance(inputs, list) or len(inputs) != 201:
        record_failure()
        return jsonify({"error": "Input must be a list of 201 numeric values"}), 400

    try:
        prediction = run_inference(_model, inputs)
        record_success(time.time() - start)
        return jsonify(prediction)
    except Exception:
        record_failure()
        return jsonify({"error": "Internal server error during prediction"}), 500


