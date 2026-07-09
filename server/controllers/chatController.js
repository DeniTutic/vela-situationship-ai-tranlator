const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const groq = require('../utils/groqClient');
 
const RESPONSE_STYLES = {
  gentle: `You are Vela, a warm and emotionally intelligent relationship clarity assistant. You speak like a trusted, caring friend. You validate emotions first, then provide gentle honest analysis. You are soft, reassuring, and emotionally supportive above all else.`,
  analytical: `You are Vela, a sharp and logical relationship clarity assistant. You focus on patterns, behaviors, and facts. Less emotional, more strategic. You help users see the situation clearly through logic and pattern recognition.`,
  brutal: `You are Vela, a brutally honest relationship clarity assistant. No sugarcoating. You tell the user exactly what is happening, including their own faults. You are direct, blunt, but never cruel.`,
  hype: `You are Vela, an energetic and confidence-boosting relationship clarity assistant. You are like that friend who always hypes you up while still keeping it real.`,
  therapist: `You are Vela, a professional and reflective relationship clarity assistant. You speak like a therapist, calm, measured, asking reflective questions.`
};
 
const MAX_TOKENS = { free: 300, plus: 600, pro: 1200 };
 
const FREE_CONVERSATION_LIMIT = 2;
const FREE_MESSAGE_PER_CONVO_LIMIT = 4;
 
const createChat = async (req, res) => {
  try {
    const { responseStyle, isPractice, practiceTarget, practiceMode } = req.body;
 
    if (!isPractice && (!req.user.subscriptionStatus || req.user.subscriptionStatus === 'free')) {
      const chatCount = await Chat.countDocuments({ userId: req.user._id, isPractice: false });
      if (chatCount >= FREE_CONVERSATION_LIMIT) {
        return res.status(403).json({
          message: 'Free plan is limited to ' + FREE_CONVERSATION_LIMIT + ' conversations. Upgrade for unlimited.',
          conversationCapReached: true
        });
      }
    }
 
    const modeLabels = { easy: 'Easy', realistic: 'Realistic', hard: 'Hard', worst: 'Worst Case' };
    const title = isPractice && practiceTarget
      ? (modeLabels[practiceMode] || 'Practice') + ' · ' + practiceTarget
      : 'New Chat';
    const chat = await Chat.create({
      userId: req.user._id,
      title,
      responseStyle: responseStyle || req.user.defaultResponseStyle,
      isPractice: isPractice || false,
      practiceTarget: practiceTarget || '',
      practiceMode: practiceMode || 'realistic'
    });
    if (isPractice) {
     await User.findByIdAndUpdate(req.user._id, { $inc: { practiceSessionsUsed: 1 } });
    }
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chat', error: err.message });
  }
};
 
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats', error: err.message });
  }
};
 
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    res.json({ chat, messages });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat', error: err.message });
  }
};
 
const sendMessage = async (req, res) => {
  try {
    const { content, inputType } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
 
    const plan = req.user.subscriptionStatus || 'free';
    const maxTokens = MAX_TOKENS[plan] || 300;
 
    if (!chat.isPractice && content !== '[[DEBRIEF_REQUEST]]' && (!req.user.subscriptionStatus || req.user.subscriptionStatus === 'free')) {
      const userMsgCount = await Message.countDocuments({ chatId: chat._id, role: 'user' });
      if (userMsgCount >= FREE_MESSAGE_PER_CONVO_LIMIT) {
        return res.status(403).json({
          message: 'Free plan is limited to ' + FREE_MESSAGE_PER_CONVO_LIMIT + ' messages per conversation. Upgrade for unlimited.',
          messageCapReached: true
        });
      }
    }
 
    await Message.create({ chatId: chat._id, role: 'user', content, inputType: inputType || 'text' });
 
    if (req.user.subscriptionStatus === 'free') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { messagesUsedToday: 1 } });
    }
 
    if (content === '[[DEBRIEF_REQUEST]]') {
      const history = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
      const debriefPrompt = 'You are now stepping out of character. The practice conversation is over. Give the user a detailed debrief of how they handled the conversation with "' + chat.practiceTarget + '". Format your response exactly like this:\n\n## Practice Debrief\n\n**Overall Score: X/10**\n\n### What You Did Well\n- [specific things]\n\n### What Hurt You\n- [specific mistakes]\n\n### What to Remove\n- [bad habits]\n\n### One Thing to Focus On Next Time\n[improvement]\n\n### Final Verdict\n[2-3 sentence summary]';
      const debriefCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: debriefPrompt },
          ...history.map(function(m) { return { role: m.role, content: m.content }; })
        ],
        max_tokens: 1024,
        temperature: 0.7
      });
      const debriefMessage = await Message.create({
        chatId: chat._id,
        role: 'assistant',
        content: debriefCompletion.choices[0].message.content
      });
      await Chat.findByIdAndUpdate(chat._id, { updatedAt: new Date() });
      return res.json({ message: debriefMessage });
    }
 
    const history = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    const messages = history.map(function(m) { return { role: m.role, content: m.content }; });
 
    let systemPrompt;
    if (chat.isPractice) {
      const modeInstructions = {
        easy: 'You are cooperative, understanding, and open to the conversation.',
        realistic: 'You react naturally and authentically, with realistic emotional responses.',
        hard: 'You are defensive, dismissive, and not easy to talk to. You push back.',
        worst: 'You are at your absolute worst, cold, reactive, and difficult.'
      };
      systemPrompt = 'You are roleplaying as "' + chat.practiceTarget + '" in a practice conversation. The user is practicing how to talk to you in real life. Difficulty: ' + (modeInstructions[chat.practiceMode] || modeInstructions.realistic) + ' Stay in character. Do NOT introduce yourself as Vela. Do NOT break character.';
    } else {
      const lengthInstruction = {
        free: 'Keep responses SHORT, 1 to 3 sentences max. Be direct and warm.',
        plus: 'Keep responses MEDIUM length, a few sentences to a short paragraph.',
        pro: 'Give DETAILED thorough responses with deeper analysis and actionable advice.'
      };
      const length = lengthInstruction[plan] || lengthInstruction.free;
      systemPrompt = RESPONSE_STYLES[chat.responseStyle] + '\n\n' + (req.user.historySummary ? 'USER HISTORY: ' + req.user.historySummary + '\n\n' : '') + 'RESPONSE LENGTH: ' + length + '\nIf you notice red flags, call them out compassionately.';
    }
 
    if (inputType === 'voice') {
      systemPrompt += '\n\nIMPORTANT: This is a spoken voice conversation. Respond in plain, natural spoken sentences only. Do NOT use Markdown formatting, asterisks, bullet points, numbered lists, or headers of any kind — your response will be read aloud by text-to-speech exactly as written.';
    }
 
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
 
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }].concat(messages),
      max_tokens: maxTokens,
      temperature: 0.8,
      stream: true
    });
 
    let fullResponse = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content ? chunk.choices[0].delta.content : '';
      if (delta) {
        fullResponse += delta;
        res.write('data: ' + JSON.stringify({ delta }) + '\n\n');
        await new Promise(function(resolve) { setTimeout(resolve, 40); });
      }
    }
 
    const aiMessage = await Message.create({
      chatId: chat._id,
      role: 'assistant',
      content: fullResponse
    });
 
    if (history.length === 1 && !chat.isPractice) {
      const titleCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Generate a short 4-6 word title for a relationship advice conversation that starts with: "' + content + '". Return only the title, nothing else.' }],
        max_tokens: 20
      });
      await Chat.findByIdAndUpdate(chat._id, { title: titleCompletion.choices[0].message.content.trim() });
    }
 
    await Chat.findByIdAndUpdate(chat._id, { updatedAt: new Date() });
    res.write('data: ' + JSON.stringify({ done: true, messageId: aiMessage._id }) + '\n\n');
    res.end();
 
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};
 
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    await Message.deleteMany({ chatId: chat._id });
    await Chat.findByIdAndDelete(chat._id);
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete chat', error: err.message });
  }
};
 
const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to rename chat', error: err.message });
  }
};
 
module.exports = { createChat, getChats, getChatById, sendMessage, deleteChat, renameChat };