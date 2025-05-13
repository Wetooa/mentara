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

app = Flask(__name__)

# Same architecture and hyperparameters used during training
model = MultiLabelNN(201, 512, 256, 0.4, 19)
model.load_state_dict(torch.load("mental_model_config2.pt", map_location=torch.device("cpu")))
model.eval()


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "inputs" not in data:
        return jsonify({"error": "Missing 'inputs' field"}), 400

    inputs = data["inputs"]

    print(len(inputs))

    if not isinstance(inputs, list) or len(inputs) != 201:
        return jsonify({"error": "Input must be a list of 201 numeric values"}), 400

    try:
        input_tensor = torch.tensor(inputs, dtype=torch.float32).unsqueeze(0)
    except Exception as e:
        return jsonify({"error": f"Invalid input format: {str(e)}"}), 400

    # Define condition names in the order they appear in model output
    condition_names = [
        "Has_Phobia", "Has_Agoraphobia", "Has_BloodPhobia", "Has_SocialPhobia", 
        "Has_ADHD", "Has_Alcohol_Problem", "Has_Binge_Eating", "Has_Drug_Problem", 
        "Has_Anxiety", "Has_Insomnia", "Has_Burnout", "Has_Bipolar", "Has_OCD", 
        "Has_Hoarding", "Has_PTSD", "Has_Panic_Disorder", "Has_Depression", 
        "Has_High_Stress", "Has_Social_Anxiety"
    ]

    with torch.no_grad():
        output = model(input_tensor)
        prediction_values = output.squeeze().tolist()
        
        
        # Apply threshold to convert to boolean (true/false)
        # Assuming 0.5 as the threshold for positive classification
        normalized_values = [value >= 90 for value in prediction_values]
        
        # Combine condition names with their normalized boolean values
        prediction = {condition: bool_val for condition, bool_val in zip(condition_names, normalized_values)}

    return jsonify(prediction)


if __name__ == "__main__":
    app.run(debug=True)
