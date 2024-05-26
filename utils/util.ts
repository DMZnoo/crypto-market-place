export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const slice = (val: any[], key: string, def: any = '') => {
  if (val.length > 0) return val.slice(-1)[0][key]
  else return def
}
