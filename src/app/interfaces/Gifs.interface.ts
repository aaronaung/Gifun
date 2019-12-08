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
    b64: string
    id: string
}
export interface GetAllGifsResponseInterface {
    gifIds: [string]
    $getGifs: Observable<GifInterface>
}
