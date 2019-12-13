import { GetFileOptions, PutFileOptions } from 'blockstack'

export interface IRequestHeaders {
    'x-auth-response': string
    'x-auth-transit-key': string
}

export interface IRequestBody {
    path: string
    content?: string
}

export interface IGaiaRequestOptions {
    body: IRequestBody
    useServer: boolean
    options?: PutFileOptions
}
