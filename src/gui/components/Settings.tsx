import { useEffect, useState } from 'react'
import { getApi } from '../utils/api'

export function Settings() {
  const [path, setPath] = useState('')

  useEffect(() => {
    getApi().getConfigPath().then((currentPath) => {
      setPath(currentPath)
    })
  }, [])

  const handleSave = async () => {
    await getApi().setConfigPath(path)
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
