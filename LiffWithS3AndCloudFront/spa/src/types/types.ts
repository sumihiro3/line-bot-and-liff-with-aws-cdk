declare global {
  interface Window {
    liff: any
  }
}

export interface LineUser {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export interface User {
  id: string
  name: string
  email: String
}

class BaseError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = new.target.name
    // 下記の行はTypeScriptの出力ターゲットがES2015より古い場合(ES3, ES5)のみ必要
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class LiffError extends BaseError {
  constructor(public code: string, message: string) {
    super(message)
  }
}
