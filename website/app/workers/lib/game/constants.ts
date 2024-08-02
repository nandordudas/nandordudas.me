const FPS = 1_000 / 60

export const MAX_DELTA_TIME = FPS

export const LEVELS = {
  easy: {
    paddle: {
      lengthRatio: 2,
    },
    ball: {
      color: 'rgba(0, 255, 0, 0.5)', // lime
      speed: 2,
    },
  },
  medium: {
    paddle: {
      lengthRatio: 4,
    },
    ball: {
      color: 'orange',
      speed: 4,
    },
  },
  hard: {
    paddle: {
      lengthRatio: 6,
    },
    ball: {
      color: 'tomato',
      speed: 6,
    },
  },
} as const

export const enum Position {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export const enum Direction {
  Up = 'up',
  Down = 'down',
}
