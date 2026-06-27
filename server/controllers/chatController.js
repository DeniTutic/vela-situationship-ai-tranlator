const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const groq = require('../utils/groqClient');

const RESPONSE_STYLES = {
  gentle: `You are Vela, a warm and emotionally intelligent relationship clarity assistant. 
You speak like a trusted, caring friend. You validate emotions first, then provide gentle honest analysis. 
You are soft, reassuring, and emotionally supportive above all else.`,

  analytical: `You are Vela, a sharp and logical relationship clarity assistant. 
You focus on patterns, behaviors, and facts. Less emotional, more strategic. 
You help users see the situation clearly through logic and pattern recognition.`,

  brutal: `You are Vela, a brutally honest relationship clarity assistant. 
No sugarcoating. You tell the user exactly what's happening, including their own faults. 
You are direct, blunt, but never cruel. You respect the user enough to tell them the hard truth.`,

  hype: `You are Vela, an energetic and confidence-boosting relationship clarity assistant. 
You are like that friend who always hypes you up while still keeping it real. 
Energetic, positive, builds confidence while giving honest advice.`,

  therapist: `You are Vela, a professional and reflective relationship clarity assistant. 
You speak like a therapist — calm, measured, asking reflective questions. 
You help users discover insights themselves rather than just telling them what to think.`
};

// @POST /api/chat/new
const createChat = async (req, res) => {
  try {
    const { responseStyle, isPractice, practiceTarget, practiceMode } = req.body

    const modeLabels = { easy: 'Easy', realistic: 'Realistic', hard: 'Hard', worst: 'Worst Case' }
    const title = isPractice && practiceTarget
      ? `${modeLabels[practiceMode] || 'Practice'} · ${practiceTarget}`
      : 'New Chat'

    const chat = await Chat.create({
      userId: req.user._id,
      title,
      responseStyle: responseStyle || req.user.defaultResponseStyle,
      isPractice: isPractice || false,
      practiceTarget: practiceTarget || '',
      practiceMode: practiceMode || 'realistic'
    })

    res.status(201).json(chat)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create chat', error: err.message })
  }
};

// @GET /api/chat
const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chats', error: err.message });
  }
};

// @GET /api/chat/:id
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

// @POST /api/chat/:id/message
const sendMessage = async (req, res) => {
  try {
    const { content, inputType } = req.body;
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Save user message
    await Message.create({ chatId: chat._id, role: 'user', content, inputType: inputType || 'text' });

    // Update message count for free users
    if (req.user.subscriptionStatus === 'free') {
      await User.findByIdAndUpdate(req.user._id, { $inc: { messagesUsedToday: 1 } });
    }

    // Check if this is a debrief request
    if (content === '[[DEBRIEF_REQUEST]]') {
      const history = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
      
      const debriefPrompt = `You are now stepping out of character. The practice conversation is over.

Give the user a detailed debrief of how they handled the conversation with "${chat.practiceTarget}".

Format your response exactly like this:

## 📊 Practice Debrief

**Overall Score: X/10**

### ✅ What You Did Well
- [specific things they did well based on the conversation]

### ⚠️ What Hurt You
- [specific mistakes or weak moments]

### 🗑️ What to Remove
- [filler phrases, bad habits, unnecessary things they said]

### 🎯 One Thing to Focus On Next Time
[single most important improvement]

### 💬 Final Verdict
[2-3 sentence honest summary of their performance]

Base everything on the actual messages in this conversation. Be specific, honest, and constructive.`

      const debriefCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: debriefPrompt },
          ...history.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 1024,
        temperature: 0.7
      })

      const debriefResponse = debriefCompletion.choices[0].message.content

      const debriefMessage = await Message.create({
        chatId: chat._id,
        role: 'assistant',
        content: debriefResponse
      })

      await Chat.findByIdAndUpdate(chat._id, { updatedAt: new Date() })
      return res.json({ message: debriefMessage })
    }

    // Get chat history for context
    const history = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    const messages = history.map(m => ({ role: m.role, content: m.content }));

    // Build system prompt
    let systemPrompt

    if (chat.isPractice) {
      const modeInstructions = {
        easy: 'You are cooperative, understanding, and open to the conversation.',
        realistic: 'You react naturally and authentically, with realistic emotional responses.',
        hard: 'You are defensive, dismissive, and not easy to talk to. You push back.',
        worst: 'You are at your absolute worst — cold, reactive, and difficult. This prepares the user for anything.'
      }
      systemPrompt = `You are roleplaying as "${chat.practiceTarget}" in a practice conversation. 
The user is practicing how to talk to you in real life.
Difficulty: ${modeInstructions[chat.practiceMode] || modeInstructions.realistic}
Stay in character. React as that person would. Keep responses short and natural like a real conversation.
Do NOT introduce yourself as Vela. Do NOT break character. Do NOT give advice.
Just respond as ${chat.practiceTarget} would.`
    } else {
      systemPrompt = RESPONSE_STYLES[chat.responseStyle] + `

${req.user.historySummary ? `USER HISTORY CONTEXT:\n${req.user.historySummary}` : ''}

Always be concise but thorough. Format your response clearly.
If you notice red flags, call them out compassionately.
If the user is at fault, point it out kindly but honestly.`
    }

    // Call Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 1024,
      temperature: 0.8
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI message
    const aiMessage = await Message.create({
      chatId: chat._id,
      role: 'assistant',
      content: aiResponse
    });

    // Auto-title the chat after first message (only for regular chats)
    if (history.length === 1 && !chat.isPractice) {
      const titleCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Generate a short 4-6 word title for a relationship advice conversation that starts with: "${content}". Return only the title, nothing else.`
        }],
        max_tokens: 20
      });

      await Chat.findByIdAndUpdate(chat._id, {
        title: titleCompletion.choices[0].message.content.trim()
      });
    }

    await Chat.findByIdAndUpdate(chat._id, { updatedAt: new Date() });

    res.json({ message: aiMessage });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
};

// @DELETE /api/chat/:id
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

// @PATCH /api/chat/:id/title
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