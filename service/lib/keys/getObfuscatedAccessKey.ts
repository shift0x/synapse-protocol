import { AccessKey } from "../../types";

export const getObfuscatedAccessKey = (key : AccessKey) : AccessKey => {
    const keyLength = key.access_key.length;
    const obfuscatedKey = `${key.access_key.substring(0, 5)}...${key.access_key.substring(keyLength-5)}`

    key.access_key = obfuscatedKey;

    return key;
}