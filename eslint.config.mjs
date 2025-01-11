import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: {
    overrides: {
      'ts/consistent-type-definitions': ['off', 'interface'],
    },
  },
  rules: {
    'style/jsx-closing-tag-location': 'off',
  },
})
