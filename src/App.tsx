import './App.css'
import AssessmentForm from './components/AssessmentForm'

function App() {
  return (
    <div className="app-wrapper">
      <header className="app-header">
        <h1 className="app-title">Career Assessment</h1>
        <p className="app-subtitle">
          Help us understand your background and interests so we can guide you towards
          the right career path.
        </p>
      </header>
      <main className="app-main">
        <AssessmentForm />
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Career Assessment Platform. All data is used solely for career-guidance research.</p>
      </footer>
    </div>
  )
}

export default App
