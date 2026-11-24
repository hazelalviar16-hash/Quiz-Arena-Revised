export const isPreviewMode = process.env.NEXT_PUBLIC_QUIZ_ARENA_MODE !== 'supabase';
export const previewPlayerId = 'preview-player';
export const previewRoomCode = '654321';

type PreviewQuestion = {
  id: string;
  question_text: string;
  position: number;
  options: string[];
  correct: number;
};

type PreviewQuiz = {
  id: string;
  title: string;
  description: string;
  status: string;
  questions: PreviewQuestion[];
};

type PreviewRoom = {
  id: string;
  room_code: string;
  quiz_id: string;
  status: string;
  host_id: string;
  current_question_id: string | null;
  question_ends_at: string | null;
  players: number;
};

type PreviewState = {
  playerName: string;
  quizzes: PreviewQuiz[];
  rooms: PreviewRoom[];
};

const storageKey = 'qa-web-preview-v1';
const initialState: PreviewState = {
  playerName: 'Preview Player',
  quizzes: [
    {
      id: 'science-sprint',
      title: 'Science Sprint',
      description: 'A quick round of space and science trivia.',
      status: 'published',
      questions: [
        {
          id: 'science-sprint-1',
          question_text: 'Which planet is known as the Red Planet?',
          position: 1,
          options: ['Venus', 'Mars', 'Jupiter', 'Mercury'],
          correct: 1,
        },
        {
          id: 'science-sprint-2',
          question_text: 'What gas do plants absorb during photosynthesis?',
          position: 2,
          options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'],
          correct: 2,
        },
      ],
    },
    {
      id: 'around-the-philippines',
      title: 'Around the Philippines',
      description: 'A draft round about Philippine geography.',
      status: 'draft',
      questions: [],
    },
  ],
  rooms: [{
    id: 'preview-guest-room',
    room_code: previewRoomCode,
    quiz_id: 'science-sprint',
    status: 'waiting',
    host_id: 'preview-host',
    current_question_id: null,
    question_ends_at: null,
    players: 3,
  }],
};

let inMemoryState = initialState;

export function readPreview(): PreviewState {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) as PreviewState : inMemoryState;
  } catch {
    return inMemoryState;
  }
}

function savePreview(state: PreviewState) {
  inMemoryState = state;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Keep the preview usable for this page session when browser storage is unavailable.
  }
}

export function setPreviewPlayerName(name = initialState.playerName) {
  savePreview({ ...readPreview(), playerName: name });
}

export function createPreviewQuiz(title: string, description: string) {
  const state = readPreview();
  const quiz = { id: crypto.randomUUID(), title, description, status: 'draft', questions: [] };
  savePreview({ ...state, quizzes: [quiz, ...state.quizzes] });
  return quiz.id;
}

export function addPreviewQuestion(quizId: string, text: string, options: string[], correct: number) {
  const state = readPreview();
  const quiz = state.quizzes.find(item => item.id === quizId);
  if (!quiz) throw Error('Quiz not found in this preview.');

  const question = {
    id: crypto.randomUUID(),
    question_text: text,
    position: quiz.questions.length + 1,
    options,
    correct,
  };
  savePreview({
    ...state,
    quizzes: state.quizzes.map(item => item.id === quizId
      ? { ...item, questions: [...item.questions, question] }
      : item),
  });
  return question;
}

export function createPreviewRoom(quizId: string) {
  const state = readPreview();
  const roomCode = String(900000 + state.rooms.length);
  const room = {
    id: crypto.randomUUID(),
    quiz_id: quizId,
    room_code: roomCode,
    status: 'waiting',
    host_id: previewPlayerId,
    current_question_id: null,
    question_ends_at: null,
    players: 1,
  };
  savePreview({ ...state, rooms: [...state.rooms, room] });
  return roomCode;
}

export function updatePreviewRoom(code: string, status: string) {
  const state = readPreview();
  savePreview({
    ...state,
    rooms: state.rooms.map(room => room.room_code === code ? { ...room, status } : room),
  });
}
