import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Dna, Upload, BarChart2, Info, Menu, X, Activity } from 'lucide-react'

const navItems = [
  { to: '/',          icon: Upload,   label: 'Predict'   },
  { to: '/compare',   icon: BarChart2, label: 'Compare'  },
  { to: '/about',     icon: Info,     label: 'About'     },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-surface border-r border-border flex-shrink-0 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent/15 flex items-center justify-center">
              <Dna className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">ConjunctivAI</div>
              <div className="text-[10px] text-dim mt-0.5">Anemia Detection</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-[10px] font-semibold text-dim uppercase tracking-widest px-2 py-2">Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-muted hover:text-white hover:bg-surface2'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-green" />
            <span className="text-[11px] text-dim">5 models · 40 features</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold">ConjunctivAI</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-muted">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-bg/90" onClick={() => setOpen(false)}>
          <div className="w-56 h-full bg-surface border-r border-border pt-14 p-3 space-y-0.5" onClick={e => e.stopPropagation()}>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive ? 'bg-accent/10 text-accent font-medium' : 'text-muted'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:mt-0 mt-12 overflow-auto">
        {children}
      </main>
    </div>
  )
}
