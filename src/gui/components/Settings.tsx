import { useEffect, useState } from 'react'
import { getApi } from '../utils/api'

export function Settings() {
  const [path, setPath] = useState('')
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    getApi().getConfigPath().then((currentPath) => {
      setPath(currentPath)
    })
    getApi().getConfig().then((config) => {
      setDebug(config.debug || false)
    })
  }, [])

  const handleSave = async () => {
    await getApi().setConfigPath(path)
    await getApi().setDebug(debug)
    window.close()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Settings</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cheatsheet File Path
          </label>
          <input
            type="text"
            value={path}
            onChange={e => setPath(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="/path/to/cheatsheet.toml"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={debug}
              onChange={e => setDebug(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Enable Debug Mode</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            If on, the application will do debug logs in $HOME/.config/cheatsheet/log.txt
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  )
}
