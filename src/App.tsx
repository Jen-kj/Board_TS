import { useState } from 'react'

function App(): JSX.Element {
  const [count, setCount] = useState(0)

  return (
    <div className="p-6 max-w-lg mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-2">Welcome 👋</h1>
      <p className="mb-3">count: {count}</p>
      <button
        className="px-3 py-1 rounded bg-black text-white"
        onClick={() => setCount((n) => n + 1)}
      >
        +1
      </button>
    </div>
  )
}

export default App
