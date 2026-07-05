module.exports = async (req, res) => {
  console.log('=== TEST ENDPOINT HIT ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  res.status(200).json({ 
    message: 'API is working!', 
    method: req.method,
    time: new Date().toISOString()
  });
};
