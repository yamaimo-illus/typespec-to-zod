import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-use-before-define': 'off',
    'ts/no-use-before-define': 'off',
  },
})
