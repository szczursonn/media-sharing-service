import { Media } from "../../models/Media";
import { MediaStorage } from "../MediaService";

export class MockMediaStorage implements MediaStorage {
    getUrl(media: Media): string {
        return ''
    }
    public async save(media: Media, file: Buffer): Promise<void> {
        
    }
    public async remove(media: Media): Promise<void> {
        
    }
}