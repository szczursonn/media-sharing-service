import { Media } from "../../models/Media";
import { MediaStorage } from "../MediaService";

export class MockMediaStorage implements MediaStorage {
    public async save(media: Media, file: Buffer): Promise<void> {
        
    }
    public async remove(media: Media): Promise<void> {
        
    }
}