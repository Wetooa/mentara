#!/bin/bash

# Mentara Security Monitoring Script
# Real-time security monitoring and alerting

echo "🔍 Starting security monitoring..."

# Monitor failed authentication attempts
tail -f /var/log/auth.log | grep --line-buffered "Failed password" | while read line; do
    echo "🚨 SECURITY ALERT: Failed authentication attempt detected"
    echo "$line"
    # In production, send to SIEM or alerting system
done &

# Monitor unusual API activity
tail -f /var/log/mentara/api.log | grep --line-buffered "error\|unauthorized\|forbidden" | while read line; do
    echo "🚨 API SECURITY ALERT: Suspicious activity detected"
    echo "$line"
done &

echo "✅ Security monitoring active"
wait
