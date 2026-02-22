import json
import os
from jsonschema import validate, ValidationError

# 1. Define the JSON schema
schema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Clinical Assessment Scale",
  "type": "object",
  "properties": {
    "scale_id": { "type": "string", "description": "Short code, e.g., PHQ-9" },
    "full_name": { "type": "string" },
    "domain": { "type": "string", "description": "e.g., Depression, Anxiety" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "clinical_text": { "type": "string", "description": "The official medical phrasing" },
          "hooks": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Natural language phrases that trigger this item"
          },
          "is_critical": { 
            "type": "boolean", 
            "default": False,
            "description": "If true, triggers immediate safety/crisis logic"
          },
          "scoring": {
            "type": "object",
            "additionalProperties": { "type": "string" },
            "description": "Mapping of numeric points to frequency labels"
          }
        },
        "required": ["id", "clinical_text", "hooks", "scoring"]
      }
    }
  },
  "required": ["scale_id", "full_name", "items"]
}


# 2. Load and validate JSON files from the jsons directory
jsons_dir = os.path.join(os.path.dirname(__file__), ".")
json_files = [f for f in os.listdir(jsons_dir) if f.endswith(".json")]

for json_file in json_files:
    file_path = os.path.join(jsons_dir, json_file)
    try:
        with open(file_path, "r") as f:
            data_instance = json.load(f)
        
        validate(instance=data_instance, schema=schema)
        print(f"✓ {json_file} is valid!")
    except ValidationError as e:
        print(f"✗ {json_file} validation error: {e.message}")
    except json.JSONDecodeError as e:
        print(f"✗ {json_file} invalid JSON format: {e.msg}")
    except Exception as e:
        print(f"✗ {json_file} error: {e}")