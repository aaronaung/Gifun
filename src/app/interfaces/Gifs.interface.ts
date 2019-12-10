import { Observable } from 'rxjs'

export interface GifInterface {
    width: number
    height: number
    fontSize?: number
    fontColor?: string
    fontFamily?: string
    fontWeight?: string
    text?: string
    textBaseline?: string
    textXCoordinate?: string
    textYCoordinate?: string
    createdAt: number
    b64?: string
    id: string
}
export interface GetAllGifsResponseInterface {
    gifIds: [string]
    gifProps: [GifInterface]
    $getGifs: Observable<GifInterface>
}
