export const FLASHCARD_PROMPT = `You are an expert educator creating flashcards from lecture notes.

Given the following lecture notes text, generate exactly {count} flashcards that cover the key concepts, definitions, and important details.

Each flashcard should have:
- "front": A clear question or prompt (1-2 sentences)
- "back": A concise answer (1-3 sentences)

RULES:
- Cover diverse topics from the material
- Avoid trivial or overly obvious questions
- Make the back specific enough to be a complete answer
- Do not number the cards

Respond with ONLY valid JSON in this exact format:
{
  "flashcards": [
    {"front": "...", "back": "..."},
    {"front": "...", "back": "..."}
  ]
}

LECTURE NOTES:
{text}`;

export const QUESTION_PROMPT = `You are an expert NLP/CS professor creating exam questions from lecture notes.

Given the following lecture notes, generate exactly {count} questions.
Question types to include: {questionTypes}

For each question, provide:
- "questionText": The question (clear, specific)
- "questionType": One of "MULTIPLE_CHOICE", "TRUE_FALSE", or "SHORT_ANSWER"
- "options": For MC questions, a JSON array of 4 options (strings). For TF, ["True", "False"]. For SA, null.
- "correctAnswer": The correct answer text (must exactly match one option for MC/TF)
- "explanation": A brief explanation of why the answer is correct (1-2 sentences)

RULES:
- Mix difficulty levels
- MC distractors should be plausible
- SA questions should require 1-3 sentence answers
- Cover diverse topics from the material

{styleGuide}

Respond with ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "questionText": "...",
      "questionType": "MULTIPLE_CHOICE",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}

LECTURE NOTES:
{text}`;

export const STYLE_GUIDE_SECTION = `STYLE GUIDE - Match the style, difficulty, and format of this previous exam:
---
{examText}
---
`;

export const GRADING_PROMPT = `You are grading a student's short answer response to an exam question.

Question: {question}
Correct answer: {correctAnswer}
Student's answer: {studentAnswer}

Grade the student's answer. Be fair but rigorous. The answer doesn't need to match word-for-word, but must demonstrate understanding of the key concepts.

Respond with ONLY valid JSON:
{
  "isCorrect": true/false,
  "feedback": "Brief explanation of why the answer is correct or incorrect, and what was missing if incorrect (1-2 sentences)"
}`;
