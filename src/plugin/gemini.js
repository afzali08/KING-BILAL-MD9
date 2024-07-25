import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config.cjs';

const geminiResponse = async (m, Matrix) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const apiKey = config.GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const validCommands = ['gemini', 'bing'];

  if (validCommands.includes(cmd)) {
    if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
      return m.reply(`_MENTION ANY IMAGE AND TYPE \n\n ${prefix + cmd}_`);
    }
    
    m.reply("*_DOWNLOADING PLEASE WAIT..._*");

    try {
      const prompt = text;
      const media = await m.quoted.download();

      const imagePart = {
        inlineData: {
          data: Buffer.from(media).toString("base64"),
          mimeType: "image/png",
        },
      };

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;

      const textResponse = await response.text();
      m.reply(`${textResponse}`);
    } catch (error) {
      console.error('*_BILAL-MD ERROR !!!_*', error);
      m.reply(`*_BILAL-MD ERROR !!!_* ${error.message}`);
      await m.React("❌");
    }
  }
};

export default geminiResponse;
