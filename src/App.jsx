
import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import {About, Contact, Experience, Tree, Tech, Hero, Navbar, Works, StarsCanvas} from './components'
import './index.css';

const App = () => {

  return (
    <>
    <BrowserRouter>
      <div className = "relative z-0 bg-primary">
      <div className ="bg-hero-pattern bg-cover bg-no-repeat bg-center">
      <Navbar />
      <Hero />
      </div>
      <About />
      <Experience />
      <Tech />
      <Tree />
      <Works />
      <div className = "relative z-0">
        <Contact />
        <StarsCanvas />
      </div>
      </div>
      </BrowserRouter>
    </>
  )
}

export default App

/*
export default function App() {
  return (
    <div className="bg-green-500 text-white p-10 text-center">
      <h1 className="text-3xl font-bold">Tailwind is working!</h1>
    </div>
  );
}
*/