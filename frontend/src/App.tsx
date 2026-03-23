import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Claude Dashboard</h1>
        <p className="text-muted-foreground">Frontend initialized successfully</p>
        <Button>Get Started</Button>
      </div>
    </div>
  )
}

export default App
