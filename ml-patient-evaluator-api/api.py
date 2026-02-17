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

from flask import Flask
from src.app import create_app
from src.routes.predict import bp as predict_bp
from src.routes.health import bp as health_bp
from src.routes.metrics import bp as metrics_bp


def build_app() -> Flask:
    app = create_app()
    app.register_blueprint(predict_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(metrics_bp)
    return app


app = build_app()


if __name__ == "__main__":
    # Port picked up from env PORT; default 10002 in compose
    app.run(host="0.0.0.0")
