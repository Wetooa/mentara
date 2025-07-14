/**
 * Production Health Check Script
 * Comprehensive health monitoring for all production services
 */

const http = require('http');
const { Client } = require('pg');
const redis = require('redis');

const services = {
  api: {
    name: 'Mentara API',
    url: 'http://api:3000/health',
    critical: true
  },
  database: {
    name: 'PostgreSQL Database',
    host: 'postgres',
    port: 5432,
    critical: true
  },
  redis: {
    name: 'Redis Cache',
    host: 'redis',
    port: 6379,
    critical: false
  }
};

async function checkApiHealth() {
  return new Promise((resolve) => {
    const req = http.get(services.api.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          service: services.api.name,
          status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
          statusCode: res.statusCode,
          response: data,
          timestamp: new Date().toISOString()
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        service: services.api.name,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        service: services.api.name,
        status: 'unhealthy',
        error: 'Request timeout',
        timestamp: new Date().toISOString()
      });
    });
  });
}

async function checkDatabaseHealth() {
  const client = new Client({
    host: services.database.host,
    port: services.database.port,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'mentara',
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT 1 as health_check');
    await client.end();

    return {
      service: services.database.name,
      status: 'healthy',
      result: result.rows[0],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: services.database.name,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function checkRedisHealth() {
  const client = redis.createClient({
    host: services.redis.host,
    port: services.redis.port,
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 5000,
  });

  try {
    await client.connect();
    await client.ping();
    await client.disconnect();

    return {
      service: services.redis.name,
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: services.redis.name,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function runHealthChecks() {
  console.log('🏥 Running health checks...');
  
  const results = await Promise.allSettled([
    checkApiHealth(),
    checkDatabaseHealth(),
    checkRedisHealth()
  ]);

  const healthReport = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    services: results.map(result => result.status === 'fulfilled' ? result.value : {
      service: 'unknown',
      status: 'unhealthy',
      error: result.reason?.message || 'Unknown error'
    })
  };

  // Determine overall health
  const criticalServicesUnhealthy = healthReport.services.filter(service => 
    service.status === 'unhealthy' && 
    (service.service.includes('API') || service.service.includes('Database'))
  );

  if (criticalServicesUnhealthy.length > 0) {
    healthReport.overall = 'unhealthy';
  }

  // Log results
  console.log('Health Check Results:');
  console.log('====================');
  console.log(`Overall Status: ${healthReport.overall.toUpperCase()}`);
  
  healthReport.services.forEach(service => {
    const emoji = service.status === 'healthy' ? '✅' : '❌';
    console.log(`${emoji} ${service.service}: ${service.status.toUpperCase()}`);
    if (service.error) {
      console.log(`   Error: ${service.error}`);
    }
  });

  // Exit with appropriate code for Docker health checks
  if (healthReport.overall === 'unhealthy') {
    process.exit(1);
  }
}

runHealthChecks().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});