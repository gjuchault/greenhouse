import * as evergreen from 'evergreen-ui'

declare module 'evergreen-ui' {
  type UseTheme = () => evergreen.Theme

  export const useTheme: UseTheme
}
