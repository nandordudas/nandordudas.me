export const FPS = 1_000 / 60 as 16.6666666667

export const MAX_DELTA_TIME = 100

export const LEVELS = {
  easy: {
    paddle: {
      lengthRatio: 2,
      speed: 2,
    },
    ball: {
      color: 'rgba(0, 255, 0, 0.5)', // lime
      speed: 1,
    },
  },
  medium: {
    paddle: {
      lengthRatio: 4,
      speed: 4,
    },
    ball: {
      color: 'orange',
      speed: 2,
    },
  },
  hard: {
    paddle: {
      lengthRatio: 6,
      speed: 6,
    },
    ball: {
      color: 'tomato',
      speed: 3,
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
  Stop = 'stop',
}
