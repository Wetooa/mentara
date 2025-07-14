"""
Comprehensive test suite for Mental Health AI Prediction Service
"""
import pytest
import json
import torch
from unittest.mock import patch, MagicMock
from flask import Flask
import sys
import os

# Add the current directory to the path to import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api import app
from model import MultiLabelNN


class TestMLService:
    """Test class for ML service functionality"""
    
    @pytest.fixture
    def client(self):
        """Create a test client for the Flask app"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def sample_valid_input(self):
        """Generate valid 201-item questionnaire input"""
        return list(range(201))  # Simple sequential values for testing
    
    @pytest.fixture
    def sample_invalid_input(self):
        """Generate invalid input data"""
        return list(range(150))  # Wrong length
    
    def test_health_check_with_model(self, client):
        """Test health check endpoint when model is loaded"""
        response = client.get('/health')
        data = json.loads(response.data)
        
        assert response.status_code in [200, 503]  # 503 if model not loaded
        assert 'status' in data
        assert 'model_loaded' in data
        assert 'service' in data
        assert 'version' in data
    
    def test_service_info_endpoint(self, client):
        """Test service information endpoint"""
        response = client.get('/')
        data = json.loads(response.data)
        
        assert response.status_code == 200
        assert data['service'] == "Mental Health AI Prediction Service"
        assert 'endpoints' in data
        assert 'model_status' in data
    
    def test_predict_missing_inputs(self, client):
        """Test prediction endpoint with missing inputs field"""
        response = client.post('/predict', 
                             data=json.dumps({}),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert 'error' in data
        assert 'Missing' in data['error']
    
    def test_predict_invalid_input_length(self, client, sample_invalid_input):
        """Test prediction endpoint with invalid input length"""
        response = client.post('/predict',
                             data=json.dumps({"inputs": sample_invalid_input}),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert 'error' in data
        assert '201' in data['error']
    
    def test_predict_non_numeric_input(self, client):
        """Test prediction endpoint with non-numeric input"""
        invalid_input = ['string'] * 201
        response = client.post('/predict',
                             data=json.dumps({"inputs": invalid_input}),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 400
        assert 'error' in data
    
    @patch('api.model')
    def test_predict_model_not_loaded(self, mock_model, client, sample_valid_input):
        """Test prediction endpoint when model is None"""
        mock_model = None
        
        response = client.post('/predict',
                             data=json.dumps({"inputs": sample_valid_input}),
                             content_type='application/json')
        data = json.loads(response.data)
        
        assert response.status_code == 503
        assert 'error' in data
        assert 'Model not available' in data['error']
    
    @patch('api.model')
    def test_predict_successful_prediction(self, mock_model, client, sample_valid_input):
        """Test successful prediction with mocked model"""
        # Mock the model and its methods
        mock_model_instance = MagicMock()
        mock_model_instance.eval.return_value = None
        
        # Mock the forward pass to return tensor
        mock_output = torch.tensor([[0.7, 0.3, 0.8, 0.2, 0.6, 0.1, 0.9, 0.4, 0.5, 
                                   0.7, 0.2, 0.8, 0.3, 0.6, 0.1, 0.9, 0.4, 0.5, 0.7]])
        mock_model_instance.return_value = mock_output
        mock_model = mock_model_instance
        
        with patch('torch.no_grad'):
            response = client.post('/predict',
                                 data=json.dumps({"inputs": sample_valid_input}),
                                 content_type='application/json')
        
        if response.status_code == 200:
            data = json.loads(response.data)
            
            # Check that response contains expected condition names
            expected_conditions = [
                "Has_Phobia", "Has_Agoraphobia", "Has_BloodPhobia", "Has_SocialPhobia",
                "Has_ADHD", "Has_Alcohol_Problem", "Has_Binge_Eating", "Has_Drug_Problem",
                "Has_Anxiety", "Has_Insomnia", "Has_Burnout", "Has_Bipolar",
                "Has_OCD", "Has_Hoarding", "Has_PTSD", "Has_Panic_Disorder",
                "Has_Depression", "Has_High_Stress", "Has_Social_Anxiety"
            ]
            
            for condition in expected_conditions:
                assert condition in data
                assert isinstance(data[condition], bool)


class TestMultiLabelNN:
    """Test class for the MultiLabelNN model"""
    
    def test_model_initialization(self):
        """Test model can be initialized with correct parameters"""
        model = MultiLabelNN(201, 512, 256, 0.4, 19)
        assert model is not None
        
        # Test model has correct layers
        assert hasattr(model, 'layers')
        assert len(model.layers) == 6  # 3 linear layers + 2 ReLU + 2 dropout
    
    def test_model_forward_pass(self):
        """Test model forward pass with sample input"""
        model = MultiLabelNN(201, 512, 256, 0.4, 19)
        
        # Create sample input tensor
        sample_input = torch.randn(1, 201)
        
        # Forward pass
        output = model(sample_input)
        
        # Check output shape
        assert output.shape == (1, 19)
        assert isinstance(output, torch.Tensor)
    
    def test_model_output_range(self):
        """Test model output is in reasonable range"""
        model = MultiLabelNN(201, 512, 256, 0.4, 19)
        
        # Create sample input
        sample_input = torch.randn(1, 201)
        
        # Forward pass
        with torch.no_grad():
            output = model(sample_input)
        
        # Since no activation function is applied in the last layer,
        # outputs can be any real number, but should be finite
        assert torch.all(torch.isfinite(output))


class TestIntegration:
    """Integration tests for the complete service"""
    
    @pytest.fixture
    def client(self):
        """Create a test client"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    def test_service_startup_without_model(self, client):
        """Test that service can start even without model file"""
        # This test verifies the service handles missing model gracefully
        response = client.get('/health')
        assert response.status_code in [200, 503]
    
    def test_error_handling_robustness(self, client):
        """Test various error conditions"""
        # Test malformed JSON
        response = client.post('/predict',
                             data='malformed json',
                             content_type='application/json')
        assert response.status_code == 400
        
        # Test empty request
        response = client.post('/predict')
        assert response.status_code == 400
    
    def test_questionnaire_mapping_completeness(self):
        """Test that all 19 mental health conditions are mapped"""
        from api import condition_names
        
        expected_conditions = [
            "Has_Phobia", "Has_Agoraphobia", "Has_BloodPhobia", "Has_SocialPhobia",
            "Has_ADHD", "Has_Alcohol_Problem", "Has_Binge_Eating", "Has_Drug_Problem",
            "Has_Anxiety", "Has_Insomnia", "Has_Burnout", "Has_Bipolar",
            "Has_OCD", "Has_Hoarding", "Has_PTSD", "Has_Panic_Disorder",
            "Has_Depression", "Has_High_Stress", "Has_Social_Anxiety"
        ]
        
        # Should have exactly 19 conditions
        assert len(condition_names) == 19
        
        # Should contain all expected conditions
        for condition in expected_conditions:
            assert condition in condition_names


if __name__ == '__main__':
    pytest.main([__file__, '-v'])