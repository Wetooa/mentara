from typing import List, Dict
import torch
from src.models.multilabel_nn import MultiLabelNN


CONDITION_NAMES: List[str] = [
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


def load_model() -> MultiLabelNN | None:
    model = MultiLabelNN(201, 512, 256, 0.4, 19)
    try:
        state_dict = torch.load("models/mental_model_config2.pt", map_location=torch.device("cpu"))
        model.load_state_dict(state_dict)
        model.eval()
        return model
    except Exception:
        return None


def run_inference(model: MultiLabelNN, inputs: List[float]) -> Dict[str, bool]:
    input_tensor = torch.tensor(inputs, dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        output = model(input_tensor)
        values = output.squeeze().tolist()
        booleans = [v >= 0.5 for v in values]
        return {name: val for name, val in zip(CONDITION_NAMES, booleans)}


