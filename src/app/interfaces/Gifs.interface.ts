export interface GIFPropertiesInterface {
    width: number
    height: number
    fontSize: number
    fontColor: string
    text: string
    textBaseline: string
    b64?: string
}

export interface GIFsObjectInterface {
    [id: string]: GIFPropertiesInterface
}
