// Placeholder non-AI chat controller (to be replaced with AI integration service)
exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message required' });
  // Simple rule-based placeholder
  if (/citrus|fresh/i.test(message)) {
    return res.json({ reply: 'You might like fresh citrus fragrances. Try exploring our Fresh category!' });
  }
  if (/sweet|gourmand/i.test(message)) {
    return res.json({ reply: 'For sweet notes, check out our gourmand selection with vanilla and caramel accords.' });
  }
  return res.json({ reply: "I'm a placeholder bot. Ask me about citrus or sweet scents!" });
};
