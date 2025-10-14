#!/bin/bash

# Script to fix auth imports after reorganization
# Changes auth/guards -> auth/core/guards
# Changes auth/decorators -> auth/core/decorators
# Changes auth/strategies -> auth/core/strategies

echo "Fixing auth imports in all files..."

# Fix guard imports
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from '\.\./auth/guards/|from '../auth/core/guards/|g" {} \;
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from '\.\./\.\./auth/guards/|from '../../auth/core/guards/|g" {} \;
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from 'src/auth/guards/|from 'src/auth/core/guards/|g" {} \;

# Fix decorator imports
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from '\.\./auth/decorators/|from '../auth/core/decorators/|g" {} \;
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from '\.\./\.\./auth/decorators/|from '../../auth/core/decorators/|g" {} \;
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from 'src/auth/decorators/|from 'src/auth/core/decorators/|g" {} \;

# Fix strategy imports (if any)
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from '\.\./auth/strategies/|from '../auth/core/strategies/|g" {} \;
find src -name "*.ts" -type f ! -path "*/auth/*" -exec sed -i "s|from '\.\./\.\./auth/strategies/|from '../../auth/core/strategies/|g" {} \;

echo "Fixed all auth imports!"
echo "Total files updated: $(find src -name "*.ts" -type f ! -path "*/auth/*" | wc -l)"

