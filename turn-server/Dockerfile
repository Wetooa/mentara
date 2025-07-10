# Use Ubuntu as base image for Coturn
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    coturn \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create coturn user and directories
RUN useradd -r -s /bin/false coturn && \
    mkdir -p /var/lib/coturn && \
    chown coturn:coturn /var/lib/coturn

# Copy configuration files
COPY turnserver.conf /etc/turnserver.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directory
RUN mkdir -p /var/log/coturn && \
    chown coturn:coturn /var/log/coturn

# Expose TURN server ports
# 3478 - STUN/TURN
# 5349 - STUN/TURN over TLS
# 49152-65535 - Media relay ports (can be restricted in production)
EXPOSE 3478 5349 49152-65535/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD netstat -ln | grep :3478 || exit 1

# Start supervisor to manage coturn
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]