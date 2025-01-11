import { Command } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getApi } from '../utils/api'

interface Shortcut {
  name: string
  cmd: string[]
}

interface Section {
  name: string
  shortcuts: Shortcut[]
}

interface Config {
  [key: string]: Section
}

export function Overlay() {
  const [config, setConfig] = useState<Config>({})

  useEffect(() => {
    getApi().getConfig().then((c) => {
      setConfig(c)
    })

    getApi().configUpdated((c) => {
      setConfig(c)
    })
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 0 * 2, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          ease: 'easeOut',
          duration: 0.5,
        }}
        className="bg-black bg-opacity-90 p-4 rounded-lg"
      >
        <div className="w-full mx-auto grid grid-cols-2 gap-4">
          {Object.entries(config).map(([key, section]) => (
            <div key={key} className="bg-white bg-opacity-10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Command className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">{section.name}</h2>
              </div>
              <div className="space-y-3">
                {section.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between text-white">
                    <span>{shortcut.name}</span>
                    <div className="flex gap-2">
                      {shortcut.cmd.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 bg-white bg-opacity-20 rounded text-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
