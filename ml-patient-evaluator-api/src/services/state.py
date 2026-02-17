import time
from typing import Dict


performance_metrics: Dict[str, float] = {
    "total_requests": 0,
    "successful_predictions": 0,
    "failed_predictions": 0,
    "total_response_time": 0.0,
    "start_time": time.time(),
}


def record_success(response_time_seconds: float) -> None:
    performance_metrics["successful_predictions"] += 1
    performance_metrics["total_response_time"] += float(response_time_seconds)


def record_failure() -> None:
    performance_metrics["failed_predictions"] += 1


def record_request() -> None:
    performance_metrics["total_requests"] += 1


def reset_metrics() -> None:
    performance_metrics["total_requests"] = 0
    performance_metrics["successful_predictions"] = 0
    performance_metrics["failed_predictions"] = 0
    performance_metrics["total_response_time"] = 0.0
    performance_metrics["start_time"] = time.time()


def get_metrics_snapshot() -> Dict[str, float]:
    uptime = time.time() - performance_metrics["start_time"]
    avg_response_time = (
        performance_metrics["total_response_time"] / performance_metrics["successful_predictions"]
        if performance_metrics["successful_predictions"] > 0
        else 0.0
    )
    return {
        "uptime_seconds": round(uptime, 2),
        "total_requests": performance_metrics["total_requests"],
        "successful_predictions": performance_metrics["successful_predictions"],
        "failed_predictions": performance_metrics["failed_predictions"],
        "success_rate": round(
            (performance_metrics["successful_predictions"] / performance_metrics["total_requests"]) * 100,
            2,
        )
        if performance_metrics["total_requests"] > 0
        else 0.0,
        "average_response_time_ms": round(avg_response_time * 1000.0, 2),
    }


