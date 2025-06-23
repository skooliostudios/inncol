const adminIPRestriction = (req, res, next) => {
  // Get client IP address (handles proxies and load balancers)
  const clientIP = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                   req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                   req.headers['x-real-ip'];

  // Parse comma-separated IP addresses from environment variable
  const adminIPs = process.env.ADMIN_IP_ADDRESSES 
    ? process.env.ADMIN_IP_ADDRESSES.split(',').map(ip => ip.trim()).filter(ip => ip)
    : [];

  // List of allowed admin IP addresses (only from environment variables)
  const allowedIPs = [
    ...adminIPs, // Multiple admin IPs from environment
    process.env.ADMIN_IP_ADDRESS // Single admin IP (for backward compatibility)
  ].filter(ip => ip); // Remove any undefined values

  console.log(`Admin login attempt from IP: ${clientIP}`);
  console.log(`Allowed IPs: ${allowedIPs.join(', ')}`);
  
  // Check if client IP is in allowed list
  const isAllowed = allowedIPs.some(allowedIP => {
    // Handle IPv4 mapped IPv6 addresses
    const normalizedClientIP = clientIP.replace(/^::ffff:/, '');
    const normalizedAllowedIP = allowedIP.replace(/^::ffff:/, '');
    
    return normalizedClientIP === normalizedAllowedIP;
  });

  if (!isAllowed) {
    console.warn(`Unauthorized admin login attempt from IP: ${clientIP}`);
    return res.status(403).json({ 
      message: 'Access denied. Unauthorized IP address.',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

module.exports = { adminIPRestriction }; 