import { Dialog } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import React, { useMemo } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import { useQuizOpen } from '../context/QuizGeneratorContext';
import CopyButton from './Editor/CopyButton';
import Modal from './Modal';
import CodeBlock from './markdown/CodeBlock/CodeBlock';

interface Answer {
  answer: string;
  explanation: string;
  correct: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

export default function QuizGeneratorModal(): JSX.Element {
  const { open, setOpen } = useQuizOpen();
  const isDarkMode = useDarkMode();
  const [quiz, setQuiz] = React.useState<Question[]>([
    { question: '', answers: [] },
  ]);
  const closeModal = () => {
    setOpen(false);
    setQuiz([{ question: '', answers: [] }]);
  };

  const editQuiz = (func: (q: Question[]) => Question[]) => {
    let prev = quiz;
    prev = func(prev);
    setQuiz([...prev]);
  };

  const changeQuestion = (newQuestion: string, idx: number) => {
    editQuiz(prev => {
      prev[idx].question = newQuestion;
      return prev;
    });
  };

  const addQuestion = () => {
    editQuiz(prev => {
      prev.push({
        question: '',
        answers: [],
      });
      return prev;
    });
  };

  const deleteQuestion = (questionIdx: number) => {
    editQuiz(prev => {
      prev.splice(questionIdx, 1);
      return prev;
    });
  };

  const addAnswer = (questionIdx: number) => {
    editQuiz(prev => {
      prev[questionIdx].answers.push({
        answer: '',
        explanation: '',
        correct: false,
      });
      return prev;
    });
  };

  const deleteAnswer = (questionIdx: number, answerIdx: number) => {
    editQuiz(prev => {
      prev[questionIdx].answers.splice(answerIdx, 1);
      return prev;
    });
  };

  const changeAnswer = (
    newAnswer: string,
    newExplanation: string,
    newCorrect: boolean,
    questionIdx: number,
    answerIdx: number
  ) => {
    editQuiz(prev => {
      prev[questionIdx].answers[answerIdx].answer = newAnswer;
      prev[questionIdx].answers[answerIdx].explanation = newExplanation;
      prev[questionIdx].answers[answerIdx].correct = newCorrect;
      return prev;
    });
  };

  const code = useMemo(() => {
    const code = `<Quiz>
  ${
    quiz
      .map(
        question =>
          `<Quiz.Question>
    ${question.question.replace(/\n/g, '\n    ') /* 4 spaces */}
    ${
      question.answers
        .map(
          answer =>
            `<Quiz.Answer${answer.correct ? ' correct' : ''}>
      ${answer.answer.replace(/\n/g, '\n      ') /* 6 spaces */}
      <Quiz.Explanation>
        ${answer.explanation.replace(/\n/g, '\n        ') /* 8 spaces */}
      </Quiz.Explanation>
    </Quiz.Answer>`
        )
        .join('\n    ') /* 4 spaces */
    }
  </Quiz.Question>`
      )
      .join('\n  ') /* 2 spaces */
  }
</Quiz>`;
    return code;
  }, [quiz]);
  return (
    <Modal isOpen={open} onClose={closeModal}>
      <Dialog.Panel className="px-4 text-center w-full max-w-4xl h-auto">
        <div className="inline-block w-full max-w-4xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-black shadow-xl rounded-2xl">
          <div className={'flex justify-between items-center'}>
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Quiz Generator
            </Dialog.Title>
            <button className={'btn'} onClick={() => addQuestion()}>
              Add question
            </button>
          </div>
          <div className={'space-y-8 mt-4'}>
            {quiz.map((question, idx) => (
              <div
                key={idx}
                className="flex border-l-4 focus-within:border-blue-500 dark:border-gray-800 dark:focus-within:border-blue-900"
              >
                <div className={'mx-2'}>
                  <button onClick={() => deleteQuestion(idx)}>
                    <XIcon className={'h-4 w-4'} />
                  </button>
                </div>
                <div className={'grow'}>
                  <label htmlFor={`question-${idx + 1}`}>
                    Question {idx + 1}
                  </label>
                  <textarea
                    id={`question-${idx + 1}`}
                    value={question.question}
                    onChange={e => changeQuestion(e.target.value, idx)}
                    className={
                      'mt-2 w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 block text-sm border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-700'
                    }
                  />
                  <div className={'ml-4'}>
                    <h5 className={'font-medium my-2'}>Answers</h5>
                    <div className={'space-y-4'}>
                      {question.answers.map((answer, i) => (
                        <div key={i} className={'flex'}>
                          <div className={'mr-1'}>
                            <button onClick={() => deleteAnswer(idx, i)}>
                              <XIcon className={'h-4 w-4'} />
                            </button>
                          </div>
                          <div className={'w-full'}>
                            <div className={'w-full flex gap-6 items-center'}>
                              <textarea
                                value={answer.answer}
                                onChange={e =>
                                  changeAnswer(
                                    e.target.value,
                                    answer.explanation,
                                    answer.correct,
                                    idx,
                                    i
                                  )
                                }
                                className={
                                  'grow shadow-sm focus:ring-blue-500 focus:border-blue-500 block text-sm border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-700'
                                }
                                placeholder={`Answer ${i + 1}`}
                              />
                              <button
                                onClick={() =>
                                  changeAnswer(
                                    answer.answer,
                                    answer.explanation,
                                    !answer.correct,
                                    idx,
                                    i
                                  )
                                }
                                className={
                                  'w-18 md:w-24 focus:ring-blue-500 focus:ring-2 rounded-md focus:outline-hidden'
                                }
                              >
                                {quiz[idx].answers[i].correct ? (
                                  <div
                                    className={
                                      'flex items-center gap-2 text-green-600 dark:text-green-300'
                                    }
                                  >
                                    <CheckCircleIcon
                                      className={'h-4 w-4 md:h-6 md:w-6'}
                                    />
                                    <span className={'text-xs md:text-sm'}>
                                      Correct
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    className={
                                      'flex items-center gap-2 text-red-600 dark:text-red-300'
                                    }
                                  >
                                    <XCircleIcon
                                      className={'h-4 w-4 md:h-6 md:w-6'}
                                    />
                                    <span className={'text-xs md:text-sm'}>
                                      Incorrect
                                    </span>
                                  </div>
                                )}
                              </button>
                            </div>
                            <textarea
                              className={
                                'mt-2 w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 block text-sm border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-700'
                              }
                              value={answer.explanation}
                              onChange={e =>
                                changeAnswer(
                                  answer.answer,
                                  e.target.value,
                                  answer.correct,
                                  idx,
                                  i
                                )
                              }
                              placeholder={'Explanation'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={'w-full flex justify-end my-2'}>
                      <button className={'btn'} onClick={() => addAnswer(idx)}>
                        Add answer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className={'relative text-sm'}>
              <CopyButton
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="btn absolute right-3 top-2"
              />
              <CodeBlock className="language-mdx" isDarkMode={isDarkMode}>
                {code}
              </CodeBlock>
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Modal>
  );
}
