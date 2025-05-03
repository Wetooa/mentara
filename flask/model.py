import torch.nn as nn

class MultiLabelNN(nn.Module):
    def __init__(self, input_dim, hidden1, hidden2, dropout_rate, output_dim):
        super(MultiLabelNN, self).__init__()
        self.layers = nn.Sequential(
            nn.Linear(input_dim, hidden1),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden1, hidden2),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(hidden2, output_dim)
        )
    def forward(self, x):
        return self.layers(x)
