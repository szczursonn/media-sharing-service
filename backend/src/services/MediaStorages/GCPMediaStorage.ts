import { Media } from "../../models/Media";
import { MediaStorage } from "../MediaService";
import { Storage } from '@google-cloud/storage'

export class GCPMediaStorage implements MediaStorage {
    private storage: Storage
    private bucketName: string

    public constructor(storage: Storage, bucketName: string) {
        this.storage = storage
        this.bucketName = bucketName
    }
    getUrl(media: Media): string {
        return `https://storage.googleapis.com/${this.bucketName}/${this.uri(media)}`
    }

    public async save(media: Media, file: Buffer): Promise<void> {
        await this.storage.bucket(this.bucketName).file(this.uri(media)).save(file)
    }

    public async remove(media: Media): Promise<void> {
        await this.storage.bucket(this.bucketName).file(this.uri(media)).delete()
    }

    private uri(media: Media) {
        return `${media.albumId}/${media.filename}`
    }
}