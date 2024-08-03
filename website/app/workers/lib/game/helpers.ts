export const logger = {
  // eslint-disable-next-line no-console
  log: (...[title, ...args]: unknown[]) => console.log(title, ...args),
}

export const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min
