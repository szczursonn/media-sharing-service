import { existsSync, mkdirSync } from "fs";
import { rm, writeFile} from "fs/promises"
import { Media } from "../../models/Media";
import { MediaStorage } from "../MediaService";
import { join } from "path";

export class LocalMediaStorage implements MediaStorage {
    private dir: string

    public constructor(dir: string) {
        this.dir = dir
        if (!existsSync(this.dir)) {
            mkdirSync(this.dir)
        }
    }

    public async save(media: Media, file: Buffer): Promise<void> {
        if (!existsSync(this.albumUri(media))) {
            mkdirSync(this.albumUri(media))
        }
        await writeFile(this.uri(media), file)
    }

    public async remove(media: Media): Promise<void> {
        await rm(this.uri(media))
    }

    private uri(media: Media) {
        return join(this.dir, media.albumId.toString(), media.filename)
    }

    private albumUri(media: Media) {
        return join(this.dir, media.albumId.toString())
    }
}