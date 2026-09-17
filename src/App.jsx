import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { questionBank, topics } from './data.js'
import logo from './img/S-Tiers Logo.png'

const COUNT_PRESETS = [10, 25, 50, 75, 100]
const STORAGE_KEY = 'stw-exam-state-v1'

function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — fail silently.
  }
}

function Icon({ name }) {
  const common = {
    width: 22,
    height: 22,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (name === 'code') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 4l-4 16" />
      </svg>
    )
  }
  if (name === 'data') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
        <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
      </svg>
    )
  }
  if (name === 'shield') {
    return (
      <svg {...common} viewBox="0 0 24 24">
        <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3Z" />
        <path d="M9.5 12.5 11.2 14l3.4-3.6" />
      </svg>
    )
  }
  return (
    <svg {...common} viewBox="0 0 24 24">
      <rect x="4" y="7" width="16" height="12" rx="2" />
      <path d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7" />
    </svg>
  )
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 12H6M11 6l-6 6 6 6" />
    </svg>
  )
}

function useFallingParticles(count) {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 7,
        duration: 9 + Math.random() * 10,
        delay: Math.random() * -18,
        drift: (Math.random() - 0.5) * 70,
        tone: i % 3 === 0 ? '#adb5bd' : i % 3 === 1 ? '#6c757d' : '#343a40',
      })),
    [count],
  )
}

function Intro({ onStart }) {
  const particles = useFallingParticles(28)

  return (
    <section className="intro">
      <div className="intro-fall" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className="fall-dot"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: p.tone,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}
      </div>
      <div className="intro-inner">
        <img className="intro-logo" src={logo} alt="S-Tiers Examination" />
        <p className="intro-tracks">
          <span>Software Engineering</span>
          <span className="star" aria-hidden="true" />
          <span>Datamanagement</span>
          <span className="star" aria-hidden="true" />
          <span>System Architecture</span>
          <span className="star" aria-hidden="true" />
          <span>It Business</span>
        </p>
        <button className="cta" onClick={onStart}>
          Get Started
        </button>
      </div>
    </section>
  )
}

function Topbar({ onNavigate }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate('intro')} aria-label="Back to intro">
        <img className="brand-logo" src={logo} alt="S-Tiers Examination" />
      </button>
    </header>
  )
}

function Home({ onPick }) {
  return (
    <section>
      <div className="hero">
        <p className="kicker">choose a topic</p>
        <h2>Practice with purpose.</h2>
        <p className="lede">
          Pick a topic, then choose Practice for guided clues or Actual Exam for a single-attempt simulation.
        </p>
      </div>
      <div className="topic-grid">
        {topics.map((topic) => (
          <div key={topic.id} className="topic-card">
            <div className="topic-top">
              <div className="index">{topic.index}</div>
              <span className="icon-blob">
                <Icon name={topic.icon} />
              </span>
            </div>
            <div>
              <h3>{topic.title}</h3>
              <p>{topic.blurb}</p>
            </div>
            <footer className="topic-actions">
              <button className="mode-btn mode-practice" onClick={() => onPick(topic, 'practice')}>
                Practice
              </button>
              <button className="mode-btn mode-exam" onClick={() => onPick(topic, 'exam')}>
                Actual Exam
              </button>
            </footer>
          </div>
        ))}
      </div>
    </section>
  )
}

function Setup({ topic, mode, count, setCount, onBack, onStart }) {
  const isExam = mode === 'exam'

  return (
    <section>
      <button className="back" onClick={onBack}>
        <BackArrow /> Back to Topics
      </button>
      <div className="setup-head">
        <div>
          <p className="kicker">{isExam ? 'actual exam' : 'practice mode'}</p>
          <h2 className="page-title">How many items?</h2>
          <p className="lede">
            {isExam
              ? '100 questions max. Each question allows a single attempt — no clues, just like the real thing.'
              : "100 questions max. Choose a length below — the next question stays hidden until it's answered correctly."}
          </p>
        </div>
        <span className="topic-pill">{topic.title}</span>
      </div>
      <div className="card">
        <p className="kicker">Quick set</p>
        <div className="count-grid">
          {COUNT_PRESETS.map((value) => (
            <button
              key={value}
              className="count-btn"
              aria-pressed={count === value}
              onClick={() => setCount(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="slider-row">
          <label htmlFor="count">Custom length · {count} items</label>
          <input
            id="count"
            type="range"
            min="1"
            max="100"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </div>
        <div className="actions">
          <button className="primary" onClick={onStart}>
            {isExam ? 'Begin exam' : 'Begin practice'}
          </button>
          <button className="ghost" onClick={onBack}>
            Change topic
          </button>
        </div>
      </div>
    </section>
  )
}

function TrueFalse({ question, selection, locked, status, onSelect }) {
  const choices = [
    { value: true, label: 'True' },
    { value: false, label: 'False' },
  ]

  return (
    <div className="tf-row">
      {choices.map((choice) => {
        const className = [
          'tf-btn',
          selection === choice.value ? 'selected' : '',
          locked && choice.value === question.answer ? 'correct' : '',
          status === 'wrong' && selection === choice.value ? 'wrong' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button key={String(choice.value)} className={className} onClick={() => onSelect(choice.value)} disabled={locked}>
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}

function MultipleChoice({ question, selection, locked, status, onSelect }) {
  return (
    <div className="options">
      {question.options.map((option, index) => {
        const className = [
          'option',
          selection === index ? 'selected' : '',
          locked && index === question.answer ? 'correct' : '',
          status === 'wrong' && selection === index ? 'wrong' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button key={option} className={className} onClick={() => onSelect(index)} disabled={locked}>
            <strong>{String.fromCharCode(65 + index)}.</strong> {option}
          </button>
        )
      })}
    </div>
  )
}

function Matching({ question, pairs, selectedLeft, locked, status, onLeft, onRight }) {
  const boardRef = useRef(null)
  const leftRefs = useRef({})
  const rightRefs = useRef({})
  const [lines, setLines] = useState([])

  useLayoutEffect(() => {
    function measure() {
      const board = boardRef.current
      if (!board) return
      const boardRect = board.getBoundingClientRect()

      const nextLines = Object.entries(pairs)
        .map(([term, rightId]) => {
          const leftEl = leftRefs.current[term]
          const rightEl = rightRefs.current[rightId]
          if (!leftEl || !rightEl) return null
          const leftRect = leftEl.getBoundingClientRect()
          const rightRect = rightEl.getBoundingClientRect()
          return {
            key: `${term}__${rightId}`,
            x1: leftRect.right - boardRect.left,
            y1: leftRect.top + leftRect.height / 2 - boardRect.top,
            x2: rightRect.left - boardRect.left,
            y2: rightRect.top + rightRect.height / 2 - boardRect.top,
            correct: question.answer[term] === rightId,
          }
        })
        .filter(Boolean)

      setLines(nextLines)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [pairs, question, locked])

  return (
    <div className="match-board" ref={boardRef}>
      <svg className="match-lines" aria-hidden="true">
        {lines.map((line) => {
          const revealed = locked || status === 'wrong'
          const lineClass = !revealed ? 'line-active' : line.correct ? 'line-correct' : 'line-wrong'
          return (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={lineClass}
            />
          )
        })}
      </svg>
      <div className="match-col">
        {question.left.map((term, i) => {
          const paired = Boolean(pairs[term])
          const rightPair = paired && pairs[term] === question.answer[term]
          const revealed = locked || status === 'wrong'
          const className = [
            'match-item',
            selectedLeft === term ? 'selected' : '',
            paired && !revealed && selectedLeft !== term ? 'paired' : '',
            revealed && paired && rightPair ? 'correct' : '',
            revealed && paired && !rightPair ? 'wrong' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={term}
              ref={(el) => {
                leftRefs.current[term] = el
              }}
              className={className}
              onClick={() => onLeft(term)}
              disabled={locked}
            >
              <span className="match-label">{String.fromCharCode(65 + i)}</span>
              <span className="match-text">{term}</span>
            </button>
          )
        })}
      </div>
      <div className="match-col">
        {question.right.map((item, i) => {
          const owner = question.left.find((term) => pairs[term] === item.id)
          const taken = Boolean(owner)
          const rightPair = taken && question.answer[owner] === item.id
          const revealed = locked || status === 'wrong'
          const className = [
            'match-item',
            taken && !revealed ? 'paired' : '',
            revealed && taken && rightPair ? 'correct' : '',
            revealed && taken && !rightPair ? 'wrong' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={item.id}
              ref={(el) => {
                rightRefs.current[item.id] = el
              }}
              className={className}
              onClick={() => onRight(item.id)}
              disabled={locked}
            >
              <span className="match-label">{i + 1}</span>
              <span className="match-text">{item.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Exam({ topic, mode, questions, index, score, onProgress, onExit, onFinish }) {
  const isExam = mode === 'exam'
  const [selection, setSelection] = useState(null)
  const [pairs, setPairs] = useState({})
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState('idle')
  const [revealed, setRevealed] = useState(false)

  const question = questions[index] ?? null

  const isCompleteMatch = useMemo(() => {
    if (!question || question.type !== 'match') return false
    return question.left.every((term) => pairs[term] === question.answer[term])
  }, [pairs, question])

  if (!question) {
    return (
      <section>
        <button className="back back-compact" onClick={onExit}>
          <BackArrow /> Leave {isExam ? 'exam' : 'practice'}
        </button>
        <div className="card">
          <p className="kicker">no questions yet</p>
          <h2 className="page-title">{topic.title} doesn't have any questions loaded.</h2>
          <p className="lede">
            Add rows to the "{topic.title}" sheet in <code>question-bank.xlsx</code>, then run{' '}
            <code>npm run build:questions</code> (or restart <code>npm run dev</code>).
          </p>
        </div>
      </section>
    )
  }

  const locked = isExam ? revealed : status === 'correct'
  const progress = ((index + (locked ? 1 : 0)) / questions.length) * 100
  const typeLabel =
    question.type === 'tf' ? 'True or False' : question.type === 'mcq' ? 'Multiple Choice' : 'Matching'

  function resetItem() {
    setSelection(null)
    setPairs({})
    setSelectedLeft(null)
    setAttempts(0)
    setStatus('idle')
    setRevealed(false)
  }

  function check() {
    let correct = false
    if (question.type === 'tf') correct = selection === question.answer
    if (question.type === 'mcq') correct = selection === question.answer
    if (question.type === 'match') correct = isCompleteMatch

    if (isExam) {
      setStatus(correct ? 'correct' : 'wrong')
      setRevealed(true)
      if (correct) onProgress({ score: score + 1 })
      return
    }

    if (correct) {
      setStatus('correct')
      return
    }
    setAttempts((value) => value + 1)
    setStatus('wrong')
  }

  function next() {
    if (index === questions.length - 1) {
      onFinish(score, questions.length)
      return
    }
    onProgress({ index: index + 1 })
    resetItem()
  }

  const canSubmit =
    question.type === 'match' ? Object.keys(pairs).length >= question.left.length : selection !== null

  return (
    <section>
      <button className="back back-compact" onClick={onExit}>
        <BackArrow /> Leave {isExam ? 'exam' : 'practice'}
      </button>
      <div className="exam-head">
        <div>
          <p className="kicker">
            {topic.title} · {isExam ? 'actual exam' : 'practice mode'}
          </p>
          <h2 className="page-title">Item {index + 1}</h2>
        </div>
        <span className="chip">
          {questions.length} item{questions.length === 1 ? '' : 's'} this session
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${progress}%` }} />
      </div>
      <article className="card">
        <div className="badge-row">
          <span className="badge">{typeLabel}</span>
          {!locked && (
            <span className="hint-note">
              {isExam ? 'One attempt per question' : 'Next is locked until correct'}
            </span>
          )}
        </div>
        <h3 className="question">{question.prompt}</h3>

        {question.type === 'tf' && (
          <TrueFalse
            question={question}
            selection={selection}
            locked={locked}
            status={status}
            onSelect={(value) => {
              if (locked) return
              setSelection(value)
              if (!isExam) setStatus('idle')
            }}
          />
        )}
        {question.type === 'mcq' && (
          <MultipleChoice
            question={question}
            selection={selection}
            locked={locked}
            status={status}
            onSelect={(value) => {
              if (locked) return
              setSelection(value)
              if (!isExam) setStatus('idle')
            }}
          />
        )}
        {question.type === 'match' && (
          <Matching
            question={question}
            pairs={pairs}
            selectedLeft={selectedLeft}
            locked={locked}
            status={status}
            onLeft={(term) => {
              if (locked) return
              setSelectedLeft((current) => (current === term ? null : term))
            }}
            onRight={(id) => {
              if (locked || !selectedLeft) return
              setPairs((current) => {
                const next = { ...current }
                if (next[selectedLeft] === id) {
                  // clicking the same meaning again unpairs it
                  delete next[selectedLeft]
                  return next
                }
                // steal this meaning away from whichever term currently holds it
                Object.keys(next).forEach((term) => {
                  if (next[term] === id) delete next[term]
                })
                next[selectedLeft] = id
                return next
              })
              setSelectedLeft(null)
              if (!isExam) setStatus('idle')
            }}
          />
        )}

        {!isExam && status === 'wrong' && (
          <div className="clue">
            <strong>Clue {Math.min(attempts, question.clues.length)}.</strong>{' '}
            {question.clues[Math.min(attempts, question.clues.length) - 1]}
          </div>
        )}
        {!isExam && status === 'correct' && (
          <div className="success-note">Correct. Next item is unlocked.</div>
        )}
        {isExam && revealed && (
          <div className={status === 'correct' ? 'success-note' : 'clue'}>
            {status === 'correct' ? 'Correct.' : 'Not quite — correct answer highlighted above.'}
          </div>
        )}

        <div className="actions">
          {locked ? (
            <button className="primary" onClick={next}>
              {index === questions.length - 1 ? 'See results' : 'Next question'}
            </button>
          ) : (
            <button className="primary" onClick={check} disabled={!canSubmit}>
              {isExam ? 'Submit answer' : 'Check answer'}
            </button>
          )}
        </div>
      </article>
    </section>
  )
}

function Results({ topic, mode, count, score, total, onHome, onRetry }) {
  const isExam = mode === 'exam'
  const percent = isExam && total ? Math.round((score / total) * 100) : 100

  return (
    <section className="card results">
      <p className="kicker">session complete</p>
      <h2>{isExam ? 'Exam submitted.' : 'Nice work.'}</h2>
      <p>
        {topic.title} · {total || count} items {isExam ? 'attempted' : 'reviewed'}
        {isExam ? ` · ${score}/${total} correct` : ''}
      </p>
      <div className="meter">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="actions" style={{ justifyContent: 'center' }}>
        <button className="primary" onClick={onRetry}>
          Try another length
        </button>
        <button className="ghost" onClick={onHome}>
          Back to topics
        </button>
      </div>
    </section>
  )
}

function isValidSession(session) {
  return Boolean(session && Array.isArray(session.questions) && session.questions.length > 0)
}

export default function App() {
  const persisted = useMemo(() => loadPersistedState(), [])

  const [screen, setScreen] = useState(() => {
    const restored = persisted?.screen ?? 'intro'
    // Don't strand the user on the exam screen with no session to show.
    return restored === 'exam' && !isValidSession(persisted?.session) ? 'setup' : restored
  })
  const [topic, setTopic] = useState(() => topics.find((t) => t.id === persisted?.topicId) ?? topics[0])
  const [mode, setMode] = useState(() => persisted?.mode ?? 'practice')
  const [count, setCount] = useState(() => persisted?.count ?? 25)
  const [result, setResult] = useState(() => persisted?.result ?? { score: 0, total: 0 })
  const [session, setSession] = useState(() => (isValidSession(persisted?.session) ? persisted.session : null))

  useEffect(() => {
    savePersistedState({
      screen,
      topicId: topic.id,
      mode,
      count,
      result,
      session,
    })
  }, [screen, topic, mode, count, result, session])

  if (screen === 'intro') {
    return <Intro onStart={() => setScreen('home')} />
  }

  return (
    <div className="app-page">
      <div className="app-shell">
        {screen !== 'setup' && screen !== 'exam' && <Topbar onNavigate={setScreen} />}
        {screen === 'home' && (
          <Home
            onPick={(picked, pickedMode) => {
              setTopic(picked)
              setMode(pickedMode)
              setScreen('setup')
            }}
          />
        )}
        {screen === 'setup' && (
          <Setup
            topic={topic}
            mode={mode}
            count={count}
            setCount={setCount}
            onBack={() => setScreen('home')}
            onStart={() => {
              const bank = questionBank[topic.id] ?? []
              const selected = shuffle(bank).slice(0, Math.min(count, bank.length))
              setSession({ questions: selected, index: 0, score: 0 })
              setScreen('exam')
            }}
          />
        )}
        {screen === 'exam' && isValidSession(session) && (
          <Exam
            topic={topic}
            mode={mode}
            questions={session.questions}
            index={session.index}
            score={session.score}
            onProgress={(patch) => setSession((prev) => ({ ...prev, ...patch }))}
            onExit={() => {
              setSession(null)
              setScreen('setup')
            }}
            onFinish={(score, total) => {
              setResult({ score, total })
              setSession(null)
              setScreen('results')
            }}
          />
        )}
        {screen === 'results' && (
          <Results
            topic={topic}
            mode={mode}
            count={count}
            score={result.score}
            total={result.total}
            onHome={() => setScreen('home')}
            onRetry={() => setScreen('setup')}
          />
        )}
      </div>
    </div>
  )
}
