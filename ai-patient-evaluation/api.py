"""
Mental Health API – Input Format Documentation

This API accepts a flat array of 201 numeric responses corresponding to standard mental health questionnaires.
Each subscale is mapped to specific index ranges in the array:

Questionnaire Index Map (0-based):
----------------------------------
- PHQ      : 0 - 14     (15 items)
- ASRS     : 15 - 32    (18 items)
- AUDIT    : 33 - 42    (10 items)
- BES      : 43 - 58    (16 items)
- DAST10   : 59 - 68    (10 items)
- GAD7     : 69 - 75    (7 items)
- ISI      : 76 - 82    (7 items)
- MBI      : 83 - 104   (22 items)
- MDQ      : 105 - 119  (15 items)
- OCI_R    : 120 - 137  (18 items)
- PCL5     : 138 - 157  (20 items)
- PDSS     : 158 - 164  (7 items)
- PHQ9     : 165 - 173  (9 items)
- PSS      : 174 - 183  (10 items)
- SPIN     : 184 - 200  (17 items)

Expected input: List[float] of length 201
"""

from flask import Flask, request, jsonify
from model import MultiLabelNN
import torch
import time
import logging
import os
from datetime import datetime

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Performance metrics storage
performance_metrics = {
    'total_requests': 0,
    'successful_predictions': 0,
    'failed_predictions': 0,
    'total_response_time': 0,
    'start_time': time.time()
}

# Same architecture and hyperparameters used during training
model = MultiLabelNN(201, 512, 256, 0.4, 19)

# Load model with proper error handling
try:
    model.load_state_dict(
        torch.load("mental_model_config2.pt", map_location=torch.device("cpu"))
    )
    model.eval()
    logger.info("✅ Model loaded successfully")
except FileNotFoundError:
    logger.error("❌ Model file 'mental_model_config2.pt' not found!")
    logger.error("Please ensure the trained model file is in the ai-patient-evaluation directory")
    model = None
except Exception as e:
    logger.error(f"❌ Error loading model: {e}")
    model = None


@app.route("/predict", methods=["POST"])
def predict():
    start_time = time.time()
    performance_metrics['total_requests'] += 1
    
    try:
        # Check if model is loaded
        if model is None:
            performance_metrics['failed_predictions'] += 1
            logger.warning("Prediction request failed: Model not loaded")
            return jsonify({
                "error": "Model not available. Please check server logs for model loading issues."
            }), 503
    
        data = request.get_json()

        if not data or "inputs" not in data:
            performance_metrics['failed_predictions'] += 1
            logger.warning("Prediction request failed: Missing 'inputs' field")
            return jsonify({"error": "Missing 'inputs' field"}), 400

        inputs = data["inputs"]
        logger.debug(f"Received prediction request with {len(inputs)} inputs")

        if not isinstance(inputs, list) or len(inputs) != 201:
            performance_metrics['failed_predictions'] += 1
            logger.warning(f"Prediction request failed: Invalid input length {len(inputs) if isinstance(inputs, list) else 'not a list'}")
            return jsonify({"error": "Input must be a list of 201 numeric values"}), 400

        try:
            input_tensor = torch.tensor(inputs, dtype=torch.float32).unsqueeze(0)
        except Exception as e:
            performance_metrics['failed_predictions'] += 1
            logger.warning(f"Prediction request failed: Invalid input format - {str(e)}")
            return jsonify({"error": f"Invalid input format: {str(e)}"}), 400

        # Define condition names in the order they appear in model output
        condition_names = [
        "Has_Phobia",
        "Has_Agoraphobia",
        "Has_BloodPhobia",
        "Has_SocialPhobia",
        "Has_ADHD",
        "Has_Alcohol_Problem",
        "Has_Binge_Eating",
        "Has_Drug_Problem",
        "Has_Anxiety",
        "Has_Insomnia",
        "Has_Burnout",
        "Has_Bipolar",
        "Has_OCD",
        "Has_Hoarding",
        "Has_PTSD",
        "Has_Panic_Disorder",
        "Has_Depression",
        "Has_High_Stress",
        "Has_Social_Anxiety",
        ]

        with torch.no_grad():
            output = model(input_tensor)
            prediction_values = output.squeeze().tolist()

            # Apply threshold to convert to boolean (true/false)
            # Using 0.5 as the threshold for positive classification
            normalized_values = [value >= 0.5 for value in prediction_values]

            # Combine condition names with their normalized boolean values
            prediction = {
                condition: bool_val
                for condition, bool_val in zip(condition_names, normalized_values)
            }
            
            # Track successful prediction
            performance_metrics['successful_predictions'] += 1
            response_time = time.time() - start_time
            performance_metrics['total_response_time'] += response_time
            
            logger.info(f"Prediction completed successfully in {response_time:.3f}s")
            
            return jsonify(prediction)
        
    except Exception as e:
        # Handle any unexpected errors
        performance_metrics['failed_predictions'] += 1
        response_time = time.time() - start_time
        logger.error(f"Unexpected error during prediction: {str(e)}")
        return jsonify({"error": "Internal server error during prediction"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify service status"""
    uptime = time.time() - performance_metrics['start_time']
    avg_response_time = (performance_metrics['total_response_time'] / 
                        performance_metrics['successful_predictions'] 
                        if performance_metrics['successful_predictions'] > 0 else 0)
    
    status = {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "service": "Mental Health AI Prediction Service",
        "version": "1.0.0",
        "uptime_seconds": round(uptime, 2),
        "performance": {
            "total_requests": performance_metrics['total_requests'],
            "successful_predictions": performance_metrics['successful_predictions'],
            "failed_predictions": performance_metrics['failed_predictions'],
            "success_rate": round(
                performance_metrics['successful_predictions'] / performance_metrics['total_requests'] * 100
                if performance_metrics['total_requests'] > 0 else 0, 2
            ),
            "average_response_time_ms": round(avg_response_time * 1000, 2)
        }
    }
    
    status_code = 200 if model is not None else 503
    return jsonify(status), status_code


@app.route("/", methods=["GET"])
def service_info():
    """Service information endpoint"""
    return jsonify({
        "service": "Mental Health AI Prediction Service",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "POST - Get mental health predictions from 201-item questionnaire",
            "/health": "GET - Service health check",
            "/metrics": "GET - Detailed performance metrics",
            "/metrics/reset": "POST - Reset performance metrics",
            "/": "GET - Service information"
        },
        "model_status": "loaded" if model is not None else "not_loaded"
    })


@app.route("/metrics", methods=["GET"])
def get_metrics():
    """Detailed performance metrics endpoint"""
    uptime = time.time() - performance_metrics['start_time']
    avg_response_time = (performance_metrics['total_response_time'] / 
                        performance_metrics['successful_predictions'] 
                        if performance_metrics['successful_predictions'] > 0 else 0)
    
    metrics = {
        "service": "Mental Health AI Prediction Service",
        "timestamp": datetime.now().isoformat(),
        "uptime": {
            "seconds": round(uptime, 2),
            "formatted": f"{int(uptime // 3600)}h {int((uptime % 3600) // 60)}m {int(uptime % 60)}s"
        },
        "requests": {
            "total": performance_metrics['total_requests'],
            "successful": performance_metrics['successful_predictions'],
            "failed": performance_metrics['failed_predictions'],
            "success_rate_percent": round(
                performance_metrics['successful_predictions'] / performance_metrics['total_requests'] * 100
                if performance_metrics['total_requests'] > 0 else 0, 2
            )
        },
        "performance": {
            "total_response_time_seconds": round(performance_metrics['total_response_time'], 3),
            "average_response_time_ms": round(avg_response_time * 1000, 2),
            "requests_per_second": round(
                performance_metrics['total_requests'] / uptime if uptime > 0 else 0, 2
            )
        },
        "model": {
            "loaded": model is not None,
            "architecture": "MultiLabelNN(201, 512, 256, 0.4, 19)" if model is not None else None,
            "input_size": 201,
            "output_size": 19
        },
        "system": {
            "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            "torch_version": torch.__version__ if model is not None else "Not loaded"
        }
    }
    
    return jsonify(metrics)


@app.route("/metrics/reset", methods=["POST"])
def reset_metrics():
    """Reset performance metrics (for testing/debugging)"""
    global performance_metrics
    performance_metrics = {
        'total_requests': 0,
        'successful_predictions': 0,
        'failed_predictions': 0,
        'total_response_time': 0,
        'start_time': time.time()
    }
    
    logger.info("Performance metrics reset")
    return jsonify({"message": "Metrics reset successfully", "timestamp": datetime.now().isoformat()})


if __name__ == "__main__":
    app.run(debug=True)
